from pydantic import BaseModel
from typing import Optional, List
from .profile import UserProfileBase, UserProfileResponse
from .health_condition import HealthConditionBase, HealthConditionResponse
from .allergy import AllergyBase, AllergyResponse
from .dietary_preference import DietaryPreferenceBase, DietaryPreferenceResponse

class ProfileOnboardingRequest(BaseModel):
    # Base user details (full_name overrides User.full_name)
    full_name: Optional[str] = None
    
    profile: Optional[UserProfileBase] = None
    health_conditions: Optional[HealthConditionBase] = None
    allergies: Optional[AllergyBase] = None
    preferences: Optional[DietaryPreferenceBase] = None

class ProfileOnboardingResponse(BaseModel):
    profile: Optional[UserProfileResponse] = None
    health_conditions: Optional[HealthConditionResponse] = None
    allergies: Optional[AllergyResponse] = None
    preferences: Optional[DietaryPreferenceResponse] = None

class HealthSummaryResponse(BaseModel):
    conditions: List[str]
    allergies: List[str]
    health_goal: Optional[str] = None

class ProfileCompletionResponse(BaseModel):
    completion_percentage: int
    profile_complete: bool
