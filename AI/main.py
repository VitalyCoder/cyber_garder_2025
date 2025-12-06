from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import httpx

from config import settings
from schemas import (
    CategorySimilarityRequest, CategorySimilarityResponse,
    PurchaseAdviceRequest, PurchaseAdviceResponse,
    GenerateSurveyRequest, GenerateSurveyResponse,
    MotivationRequest, MotivationResponse,
    ParseLinkRequest, ParseLinkResponse,
    ChatRequest, ChatResponse, ChatMessage,
    FinancialPlanRequest, FinancialPlanResponse
)
from prompts import (
    get_category_prompt, get_advice_prompt,
    get_survey_prompt, get_motivation_prompt,
    get_parser_prompt, get_chat_system_prompt,
    get_financial_plan_prompt
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
        # Нормализация статуса, если LLM вернула бред (она так любит делать)
        if result.get("status") not in ["APPROVED", "COOLING", "BLOCKED"]:
            result["status"] = "COOLING"
        return PurchaseAdviceResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/generate-survey", response_model=GenerateSurveyResponse)
async def generate_survey(request: GenerateSurveyRequest):
    """Генерация опроса для вишлиста"""
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

@app.post("/ai/parse-link", response_model=ParseLinkResponse)
async def parse_link(request: ParseLinkRequest):
    """
    Парсинг данных о товаре по ссылке.
    1. Jina Reader скачивает страницу и превращает в текст.
    2. GPT ищет в тексте цену и название.
    """

    # Она работает как прокси: https://r.jina.ai/
    jina_url = f"https://r.jina.ai/{request.url}"

    headers = {
        "X-Return-Format": "text",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    # 1. Скачиваем страницу через Jina
    page_text = ""
    async with httpx.AsyncClient(timeout=50.0) as client:
        try:
            resp = await client.get(jina_url, headers=headers)
            if resp.status_code != 200:
                 return ParseLinkResponse(
                    product_name="", price=0, found=False,
                    error=f"Jina Error: {resp.status_code}"
                )
            page_text = resp.text
        except Exception as e:
            return ParseLinkResponse(
                product_name="", price=0, found=False,
                error=f"Connection Error: {str(e)}"
            )

    # Если Jina вернула слишком мало текста значит капча(
    if len(page_text) < 100:
         return ParseLinkResponse(
            product_name="", price=0, found=False,
            error="Page content too short (blocked?)"
        )

    prompt = get_parser_prompt(page_text)

    try:
        result = await ask_gpt_json(prompt, temperature=0.2)

        return ParseLinkResponse(
            product_name=result.get("product_name", "Не найдено"),
            price=result.get("price", 0),
            found=result.get("found", False),
            error=None
        )
    except Exception as e:
        return ParseLinkResponse(
            product_name="", price=0, found=False,
            error=f"AI Error: {str(e)}"
        )

@app.post("/ai/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    """
    Умный финансовый чат-бот с контекстом пользователя.
    """
    # Генерация промта с данными юзера
    system_instruction = get_chat_system_prompt(request.context)

    # Собираем историю сообщений для OpenAI
    messages = [{"role": "system", "content": system_instruction}]

    for msg in request.history:
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": request.message})

    try:
        from ai_client import client
        from config import settings

        response = await client.chat.completions.create(
            model=settings.MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )

        reply_text = response.choices[0].message.content
        is_refusal = "извини, я разбираюсь только в финансах" in reply_text.lower()
        return ChatResponse(reply=reply_text, is_refusal=is_refusal)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat Error: {str(e)}")

@app.post("/ai/financial-plan", response_model=FinancialPlanResponse)
async def generate_financial_plan(request: FinancialPlanRequest):
    """Генерация профессионального фин. плана"""
    prompt = get_financial_plan_prompt(request)

    try:
        result = await ask_gpt_json(prompt, temperature=0.7)
        return FinancialPlanResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
