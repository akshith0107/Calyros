from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.chat import ChatStartRequest, ChatMessagePayload, ChatMessageResponse, ChatSessionResponse
from app.services.chat_service import chat_service

router = APIRouter()

@router.post("/start", response_model=ChatSessionResponse)
def start_chat(
    payload: ChatStartRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Check if session already exists for this scan to reuse it
        existing = chat_service.get_history(db, current_user.id, payload.scan_id)
        if existing:
            return existing
            
        # Start new
        session = chat_service.start_session(db, current_user.id, payload.scan_id)
        return session
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.post("/{session_id}/message")
async def send_message(
    session_id: UUID,
    payload: ChatMessagePayload = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        generator = await chat_service.send_message_stream(db, current_user.id, session_id, payload.message)
        return StreamingResponse(generator, media_type="text/event-stream")
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{scan_id}", response_model=ChatSessionResponse)
def get_chat_history(
    scan_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        session = chat_service.get_history(db, current_user.id, scan_id)
        if not session:
            # If no history, create an empty session implicitly so the frontend has a session_id
            session = chat_service.start_session(db, current_user.id, scan_id)
        return session
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

from pydantic import BaseModel
class CompareChatRequest(BaseModel):
    scan_id_1: UUID
    scan_id_2: UUID
    message: str

@router.post("/compare_stream")
async def send_compare_message(
    payload: CompareChatRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        generator = await chat_service.send_compare_message_stream(
            db=db,
            user_id=current_user.id,
            scan_id_1=payload.scan_id_1,
            scan_id_2=payload.scan_id_2,
            message=payload.message
        )
        return StreamingResponse(generator, media_type="text/event-stream")
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class GlobalChatRequest(BaseModel):
    message: str

@router.post("/global_stream")
async def send_global_message(
    payload: GlobalChatRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        generator = await chat_service.send_global_message_stream(
            db=db,
            user_id=current_user.id,
            message=payload.message
        )
        return StreamingResponse(generator, media_type="text/event-stream")
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
