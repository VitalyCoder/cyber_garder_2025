from pydantic import BaseModel, Field, conlist, confloat
from typing import List, Union, Any, Optional

class CategorySimilarityRequest(BaseModel):
    user_category: str
    blacklist_categories: List[str] = []

class CategorySimilarityResponse(BaseModel):
    is_blocked: bool
    similarity: float = Field(..., ge=0.0, le=1.0)
    related_to: Optional[str] = None
    reason: str

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

class MotivationRequest(BaseModel):
    action: str
    product_name: str
    nickname: str
    price: int
    savings_delta: int

class MotivationResponse(BaseModel):
    message: str

class ParseLinkRequest(BaseModel):
    url: str

class ParseLinkResponse(BaseModel):
    product_name: str
    price: int
    currency: str = "RUB"
    found: bool = True
    error: Optional[str] = None

class ChatContext(BaseModel):
    nickname: str
    monthly_income: int
    current_savings: int
    monthly_savings: int
    wishlist_summary: Optional[str] = "Вишлист пуст"

    blacklist_categories: List[str] = []

    expense_stats: Optional[str] = "Нет данных о тратах"

class ChatMessage(BaseModel):
    role: str = Field(pattern='^(user|assistant)$')
    content: str

class ChatRequest(BaseModel):
    message: str
    context: ChatContext
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: str
    is_refusal: bool = False

class FinancialPlanRequest(BaseModel):
    nickname: str
    monthly_income: int
    current_savings: int
    monthly_savings_goal: int
    expenses_breakdown: str
    financial_goal: str
    goal_cost: int

class FinancialPlanResponse(BaseModel):
    plan_markdown: str
    key_steps: List[str]
