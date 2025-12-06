from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import json
import httpx
import logging

from config import settings
from schemas import (
    CategorySimilarityRequest, CategorySimilarityResponse,
    PurchaseAdviceRequest, PurchaseAdviceResponse,
    GenerateSurveyRequest, GenerateSurveyResponse,
    MotivationRequest, MotivationResponse,
    ParseLinkRequest, ParseLinkResponse,
    ChatRequest, ChatResponse,
    FinancialPlanRequest, FinancialPlanResponse
)
from prompts import (
    get_category_prompt, get_advice_prompt,
    get_survey_prompt, get_motivation_prompt,
    get_parser_prompt, get_chat_system_prompt,
    get_financial_plan_prompt, get_perplexity_prompt
)
from ai_client import ask_gpt_json, ask_perplexity, client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ZenBalance AI Service", version="2.0")

# Убираем APIRouter и префикс /v1, чтобы пути совпадали с тестами
# router = APIRouter(prefix="/v1")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

def handle_ai_result(result: dict, response_model):
    """Централизованный обработчик ответов от AI. Не дает упасть, если AI вернул {}."""
    if not result:
        raise HTTPException(status_code=500, detail="AI returned an empty response.")
    try:
        return response_model(**result)
    except Exception:
        # Если модель не смогла создать схему, возвращаем ошибку
        raise HTTPException(status_code=500, detail=f"AI returned invalid structure: {result}")


@app.get("/health")
def health_check():
    return {"status": "ok", "model": settings.MODEL, "version": app.version}

@app.post("/ai/category-similarity", response_model=CategorySimilarityResponse)
async def category_similarity(request: CategorySimilarityRequest):
    if not request.blacklist_categories:
        return CategorySimilarityResponse(is_blocked=False, similarity=0.0, reason="Blacklist is empty")

    prompt = get_category_prompt(request.user_category, request.blacklist_categories)
    result = await ask_gpt_json(prompt, temperature=settings.TEMP_CATEGORY)
    return handle_ai_result(result, CategorySimilarityResponse)

@app.post("/ai/purchase-advice", response_model=PurchaseAdviceResponse)
async def purchase_advice(request: PurchaseAdviceRequest):
    prompt = get_advice_prompt(request)
    result = await ask_gpt_json(prompt, temperature=settings.TEMP_ADVICE)

    if result and result.get("status") not in ["APPROVED", "COOLING", "BLOCKED"]:
        result["status"] = "COOLING" # Нормализация

    return handle_ai_result(result, PurchaseAdviceResponse)

@app.post("/ai/generate-survey", response_model=GenerateSurveyResponse)
async def generate_survey(request: GenerateSurveyRequest):
    if not request.wishlist_items:
        return GenerateSurveyResponse(title="Вишлист пуст", message="Добавьте товары, чтобы я мог помочь!", items=[])

    items_str = json.dumps([item.model_dump() for item in request.wishlist_items], ensure_ascii=False)
    prompt = get_survey_prompt(request.nickname, items_str)
    result = await ask_gpt_json(prompt, temperature=settings.TEMP_SURVEY)
    return handle_ai_result(result, GenerateSurveyResponse)

@app.post("/ai/motivation", response_model=MotivationResponse)
async def motivation(request: MotivationRequest):
    prompt = get_motivation_prompt(request)
    result = await ask_gpt_json(prompt, temperature=settings.TEMP_MOTIVATION)
    return handle_ai_result(result, MotivationResponse)

@app.post("/ai/parse-link", response_model=ParseLinkResponse)
async def parse_link(request: ParseLinkRequest):
    pplx_messages = get_perplexity_prompt(request.url)
    pplx_result = await ask_perplexity(pplx_messages)

    if pplx_result and pplx_result.get("found"):
        return ParseLinkResponse(**pplx_result)

    jina_url = f"https://r.jina.ai/{request.url}"
    headers = {"X-Return-Format": "text", "User-Agent": "Mozilla/5.0"}

    try:
        async with httpx.AsyncClient(timeout=50.0) as http_client:
            resp = await http_client.get(jina_url, headers=headers)
        if resp.status_code != 200:
            return ParseLinkResponse(found=False, error=f"Jina Error: {resp.status_code}", product_name="", price=0)
        page_text = resp.text
    except Exception as e:
        return ParseLinkResponse(found=False, error=str(e), product_name="", price=0)

    if len(page_text) < 100:
        return ParseLinkResponse(found=False, error="Page content too short (blocked?)", product_name="", price=0)

    prompt = get_parser_prompt(page_text)
    result = await ask_gpt_json(prompt, temperature=0.2)
    return handle_ai_result(result, ParseLinkResponse)


@app.post("/ai/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    system_instruction = get_chat_system_prompt(request.context.model_dump())
    messages = [{"role": "system", "content": system_instruction}]
    messages.extend([msg.model_dump() for msg in request.history])
    messages.append({"role": "user", "content": request.message})

    try:
        response = await client.chat.completions.create(
            model=settings.MODEL, messages=messages, temperature=0.7, max_tokens=500
        )
        reply_text = response.choices[0].message.content
        is_refusal = "sorry" in reply_text.lower() or "извини" in reply_text.lower()
        return ChatResponse(reply=reply_text, is_refusal=is_refusal)
    except Exception as e:
        logger.error(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat Error: {str(e)}")


@app.post("/ai/financial-plan", response_model=FinancialPlanResponse)
async def generate_financial_plan(request: FinancialPlanRequest):
    prompt = get_financial_plan_prompt(request)
    result = await ask_gpt_json(prompt, temperature=0.7)
    return handle_ai_result(result, FinancialPlanResponse)

# app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
