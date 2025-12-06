from pydantic import BaseModel, Field
from typing import List, Optional, Union, Any

class CategorySimilarityRequest(BaseModel):
    user_category: str
    blacklist_categories: List[str]

class CategorySimilarityResponse(BaseModel):
    is_blocked: bool
    similarity: float
    related_to: Optional[str] = None
    reason: Optional[str] = None

class PurchaseAdviceRequest(BaseModel):
    product_name: str
    price: int = Field(gt=0, le=999_999_999, description="Price must be positive.")
    user_income: int = Field(gt=0, description="Income must be positive.")
    user_savings: int = Field(ge=0)
    monthly_savings: int = Field(ge=0)
    cooling_days: int = Field(ge=0)

class PurchaseAdviceResponse(BaseModel):
    status: str
    advice: str
    key_message: str
    confidence: float

class WishlistItem(BaseModel):
    name: str
    price: int
    days_left: int
    status: str

class GenerateSurveyRequest(BaseModel):
    nickname: str
    wishlist_items: List[WishlistItem]
    monthly_savings: int = Field(ge=0)

class GenerateSurveyResponse(BaseModel):
    title: str
    message: str
    items: List[Any] # Ослабляем проверку, т.к. AI часто ошибается

class MotivationRequest(BaseModel):
    action: str = Field(pattern=r"^(product_removed|impulse_detected|product_ready)$")
    product_name: str
    nickname: str
    price: int = Field(ge=0)
    savings_delta: int = Field(ge=0)

class MotivationResponse(BaseModel):
    message: str

class ParseLinkRequest(BaseModel):
    url: str = Field(pattern=r"^https?://[^\s/$.?#].[^\s]*$")

class ParseLinkResponse(BaseModel):
    product_name: str = ""
    price: int = 0
    found: bool = False
    error: Optional[str] = None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatContext(BaseModel):
    nickname: str
    monthly_income: int
    current_savings: int
    monthly_savings: int
    wishlist_summary: Optional[str] = None
    blacklist_categories: Optional[List[str]] = []
    expense_stats: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    context: ChatContext
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: str
    is_refusal: bool

class FinancialPlanRequest(BaseModel):
    nickname: str
    monthly_income: int
    current_savings: int
    monthly_savings_goal: int
    expenses_breakdown: Any
    financial_goal: str
    goal_cost: int

class FinancialPlanResponse(BaseModel):
    plan_markdown: str
    key_steps: List[str]
