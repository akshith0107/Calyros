from app.core.database import Base

# Import all models here so Alembic can find them automatically
from .mixins import UUIDMixin, TimestampMixin
from .user import User
from .profile import UserProfile
from .health_condition import HealthCondition
from .allergy import Allergy
from .product import Product
from .nutrition_fact import NutritionFact
from .ingredient import Ingredient
from .product_ingredient import ProductIngredient
from .scan_history import ScanHistory
from .food_score import FoodScore
from .ai_recommendation import AIRecommendation
from .dietary_preference import DietaryPreference
from .chat_session import ChatSession
from .chat_message import ChatMessage
from .user_analytics import BMIHistory, NutritionTargets, UserGoals

# Explicitly export the classes
__all__ = [
    "Base",
    "UUIDMixin",
    "TimestampMixin",
    "User",
    "UserProfile",
    "HealthCondition",
    "Allergy",
    "DietaryPreference",
    "Product",
    "NutritionFact",
    "Ingredient",
    "ProductIngredient",
    "ScanHistory",
    "FoodScore",
    "AIRecommendation",
    "ChatSession",
    "ChatMessage"
]
