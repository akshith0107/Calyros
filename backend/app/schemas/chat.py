from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class ChatStartRequest(BaseModel):
    scan_id: UUID

class ChatMessagePayload(BaseModel):
    message: str

class ChatMessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    id: UUID
    scan_id: UUID
    messages: List[ChatMessageResponse]

    class Config:
        from_attributes = True
