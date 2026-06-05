from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.user import User
from app.models.product import Product

router = APIRouter()

@router.get("/users")
def get_users(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    users = db.query(User).limit(50).all()
    return [{"id": u.id, "email": u.email, "role": u.role} for u in users]

@router.get("/products")
def get_products(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    products = db.query(Product).limit(50).all()
    return [{"id": p.id, "name": p.product_name, "brand": p.brand} for p in products]
