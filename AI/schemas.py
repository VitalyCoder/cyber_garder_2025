from pydantic import BaseModel, Field, conlist, confloat
from typing import List, Union, Any, Optional

# --- 1. Category Similarity ---
class CategorySimilarityRequest(BaseModel):
    user_category: str
    blacklist_categories: List[str] = []

class CategorySimilarityResponse(BaseModel):
    is_blocked: bool
    similarity: float = Field(..., ge=0.0, le=1.0)
    related_to: Optional[str] = None
    reason: str

# --- 2. Purchase Advice ---
class PurchaseAdviceRequest(BaseModel):
    product_name: str
    price: int
    user_income: int
    user_savings: int
    monthly_savings: int
    cooling_days: int

class PurchaseAdviceResponse(BaseModel):
    status: str = Field(pattern='^(APPROVED|COOLING|BLOCKED)$')
    advice: str
    key_message: str
    confidence: Any = None

# --- 3. Generate Survey ---
class WishlistItem(BaseModel):
    name: str
    price: int
    days_left: int
    status: str

class GenerateSurveyRequest(BaseModel):
    wishlist_items: List[WishlistItem]
    nickname: str
    monthly_savings: int

class SurveyOption(BaseModel):
    label: str
    action: str

class SurveyItem(BaseModel):
    product_name: str = Field(..., alias="name")
    price: int = 0
    question: str
    status: str
    days_left: int
    options: List[Union[SurveyOption, str]]
    class Config:
        populate_by_name = True

class GenerateSurveyResponse(BaseModel):
    title: str
    items: List[SurveyItem]
    message: str

# --- 4. Motivation ---
class MotivationRequest(BaseModel):
    action: str
    product_name: str
    nickname: str
    price: int
    savings_delta: int

class MotivationResponse(BaseModel):
    message: str
