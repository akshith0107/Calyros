from typing import Optional, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.profile import UserProfile
from app.models.health_condition import HealthCondition
from app.models.allergy import Allergy
from app.models.dietary_preference import DietaryPreference
from app.schemas.profile_payloads import ProfileOnboardingRequest

class ProfileRepository:
    """Repository that orchestrates the composite Profile models."""

    def get_by_user_id(self, db: Session, user_id: UUID) -> Dict[str, Any]:
        import logging
        logger = logging.getLogger(__name__)

        # Optimize 5 queries into 1 using outer joins
        result = db.query(User, UserProfile, HealthCondition, Allergy, DietaryPreference)\
            .outerjoin(UserProfile, User.id == UserProfile.user_id)\
            .outerjoin(HealthCondition, User.id == HealthCondition.user_id)\
            .outerjoin(Allergy, User.id == Allergy.user_id)\
            .outerjoin(DietaryPreference, User.id == DietaryPreference.user_id)\
            .filter(User.id == user_id).first()

        if not result:
            logger.error(f"[PROFILE LOOKUP] User not found for UUID: {user_id}")
            return None
        
        user, profile, health, allergy, pref = result

        return {
            "user": user,
            "profile": profile,
            "health_conditions": health,
            "allergies": allergy,
            "preferences": pref,
        }

    def exists(self, db: Session, user_id: UUID) -> bool:
        return db.query(UserProfile).filter(UserProfile.user_id == user_id).first() is not None

    def create(self, db: Session, user_id: UUID, obj_in: ProfileOnboardingRequest) -> Dict[str, Any]:
        if self.exists(db, user_id):
            raise ValueError("Profile already exists for this user")

        # Sync User Full Name
        user = db.query(User).filter(User.id == user_id).first()
        if user and obj_in.full_name:
            user.full_name = obj_in.full_name
            db.add(user)

        profile = None
        if obj_in.profile:
            profile = UserProfile(user_id=user_id, **obj_in.profile.model_dump(exclude_unset=True))
            db.add(profile)
            
        health = None
        if obj_in.health_conditions:
            health = HealthCondition(user_id=user_id, **obj_in.health_conditions.model_dump(exclude_unset=True))
            db.add(health)
            
        allergy = None
        if obj_in.allergies:
            allergy = Allergy(user_id=user_id, **obj_in.allergies.model_dump(exclude_unset=True))
            db.add(allergy)
            
        pref = None
        if obj_in.preferences:
            pref = DietaryPreference(user_id=user_id, **obj_in.preferences.model_dump(exclude_unset=True))
            db.add(pref)

        db.commit()

        if profile: db.refresh(profile)
        if health: db.refresh(health)
        if allergy: db.refresh(allergy)
        if pref: db.refresh(pref)

        return {
            "profile": profile,
            "health_conditions": health,
            "allergies": allergy,
            "preferences": pref
        }

    def update(self, db: Session, user_id: UUID, obj_in: ProfileOnboardingRequest) -> Dict[str, Any]:
        user = db.query(User).filter(User.id == user_id).first()
        if user and obj_in.full_name:
            user.full_name = obj_in.full_name
            db.add(user)

        # Update or Create Sub-models
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if obj_in.profile:
            if not profile:
                profile = UserProfile(user_id=user_id, **obj_in.profile.model_dump(exclude_unset=True))
                db.add(profile)
            else:
                for k, v in obj_in.profile.model_dump(exclude_unset=True).items():
                    setattr(profile, k, v)
                db.add(profile)

        health = db.query(HealthCondition).filter(HealthCondition.user_id == user_id).first()
        if obj_in.health_conditions:
            if not health:
                health = HealthCondition(user_id=user_id, **obj_in.health_conditions.model_dump(exclude_unset=True))
                db.add(health)
            else:
                for k, v in obj_in.health_conditions.model_dump(exclude_unset=True).items():
                    setattr(health, k, v)
                db.add(health)
                
        allergy = db.query(Allergy).filter(Allergy.user_id == user_id).first()
        if obj_in.allergies:
            if not allergy:
                allergy = Allergy(user_id=user_id, **obj_in.allergies.model_dump(exclude_unset=True))
                db.add(allergy)
            else:
                for k, v in obj_in.allergies.model_dump(exclude_unset=True).items():
                    setattr(allergy, k, v)
                db.add(allergy)

        pref = db.query(DietaryPreference).filter(DietaryPreference.user_id == user_id).first()
        if obj_in.preferences:
            if not pref:
                pref = DietaryPreference(user_id=user_id, **obj_in.preferences.model_dump(exclude_unset=True))
                db.add(pref)
            else:
                for k, v in obj_in.preferences.model_dump(exclude_unset=True).items():
                    setattr(pref, k, v)
                db.add(pref)

        db.commit()

        if profile: db.refresh(profile)
        if health: db.refresh(health)
        if allergy: db.refresh(allergy)
        if pref: db.refresh(pref)

        return {
            "profile": profile,
            "health_conditions": health,
            "allergies": allergy,
            "preferences": pref
        }

    def delete(self, db: Session, user_id: UUID) -> bool:
        # User is the parent; deleting User cascades deletes to profile, health, allergy, dietary.
        # But if we just want to delete the profile layers and keep the auth user:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        health = db.query(HealthCondition).filter(HealthCondition.user_id == user_id).first()
        allergy = db.query(Allergy).filter(Allergy.user_id == user_id).first()
        pref = db.query(DietaryPreference).filter(DietaryPreference.user_id == user_id).first()
        
        deleted = False
        if profile: db.delete(profile); deleted = True
        if health: db.delete(health); deleted = True
        if allergy: db.delete(allergy); deleted = True
        if pref: db.delete(pref); deleted = True

        if deleted:
            db.commit()
            return True
        return False

profile_repo = ProfileRepository()
