from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json

from config import settings
from schemas import (
    CategorySimilarityRequest, CategorySimilarityResponse,
    PurchaseAdviceRequest, PurchaseAdviceResponse,
    GenerateSurveyRequest, GenerateSurveyResponse,
    MotivationRequest, MotivationResponse
)
from prompts import (
    get_category_prompt, get_advice_prompt,
    get_survey_prompt, get_motivation_prompt
)
from ai_client import ask_gpt_json

app = FastAPI(title="ZenBalance AI Service", version="2.0")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "model": settings.MODEL}

@app.post("/ai/category-similarity", response_model=CategorySimilarityResponse)
async def category_similarity(request: CategorySimilarityRequest):
    """Проверка категории на черный список (синонимизация)"""
    if not request.blacklist_categories:
        return CategorySimilarityResponse(
            is_blocked=False, similarity=0.0, reason="Черный список пуст"
        )

    prompt = get_category_prompt(request.user_category, request.blacklist_categories)

    try:
        result = await ask_gpt_json(prompt, temperature=settings.TEMP_CATEGORY)
        return CategorySimilarityResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/purchase-advice", response_model=PurchaseAdviceResponse)
async def purchase_advice(request: PurchaseAdviceRequest):
    """Финансовый совет и статус покупки"""
    prompt = get_advice_prompt(request)

    try:
        result = await ask_gpt_json(prompt, temperature=settings.TEMP_ADVICE)
        # Нормализация статуса, если LLM вернула что-то странное
        if result.get("status") not in ["APPROVED", "COOLING", "BLOCKED"]:
            result["status"] = "COOLING"
        return PurchaseAdviceResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/generate-survey", response_model=GenerateSurveyResponse)
async def generate_survey(request: GenerateSurveyRequest):
    """Генерация опроса для вишлиста"""
    # Сериализуем товары в JSON строку для промта
    items_str = json.dumps([item.model_dump() for item in request.wishlist_items], ensure_ascii=False)
    prompt = get_survey_prompt(request.nickname, items_str)

    try:
        result = await ask_gpt_json(prompt, temperature=settings.TEMP_SURVEY)
        return GenerateSurveyResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/motivation", response_model=MotivationResponse)
async def motivation(request: MotivationRequest):
    """Генерация мотивационного сообщения"""
    prompt = get_motivation_prompt(request)

    try:
        result = await ask_gpt_json(prompt, temperature=settings.TEMP_MOTIVATION)
        return MotivationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
