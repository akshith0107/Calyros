from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

class UserRepository(BaseRepository[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(self.model).filter(self.model.email == email).first()

    def create(self, db: Session, obj_in: UserCreate) -> User:
        # In a real app, hash the password using passlib here.
        # For now, just map it.
        obj_data = obj_in.model_dump()
        password = obj_data.pop("password")
        obj_data["password_hash"] = password
        
        db_obj = self.model(**obj_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

user_repo = UserRepository(User)
