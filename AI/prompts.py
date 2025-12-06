from config import settings
import textwrap
from typing import Any, List, Optional

def get_category_prompt(user_category: str, blacklist: list) -> str:
    return f"""
    Analyze semantic similarity between category '{user_category}' and blacklist: {blacklist}.
    Return JSON:
    {{
        "is_blocked": boolean,
        "similarity": float (0.0-1.0),
        "related_to": "string or null",
        "reason": "short explanation"
    }}
    If similarity > {settings.TEMP_CATEGORY}, set is_blocked=true.
    """

def get_advice_prompt(data: dict) -> str:
    if not isinstance(data, dict): data = data.model_dump()
    return f"""
    Act as a financial advisor.
    User Info: Income {data['user_income']}, Savings {data['user_savings']}.
    Product: {data['product_name']} for {data['price']} RUB.

    **CRITICAL RULE: CAPPUCCINO INDEX**
    If price > 5% of user_income, you MUST add a "Cappuccino Index" to the 'advice' text.
    - Compare price to coffee (300 RUB) or shawarma (250 RUB).
    - Example: "This is like 100 cups of coffee!". Be creative.
    - THIS IS A MANDATORY RULE.

    Logic for "status":
    1. If price > 50% of savings -> "BLOCKED".
    2. If price > 30% of income -> "COOLING".
    3. Else -> "APPROVED".

    Return JSON with status, advice (max 40 words, with Cappuccino Index if needed), key_message (max 5 words), confidence (0.95).
    """

def get_survey_prompt(nickname: str, items_json: str) -> str:
    return f"""
    Create a fun survey for user '{nickname}' about their wishlist: {items_json}.
    For EACH item, create a question to check if they truly need it.

    Return ONLY a valid JSON object matching this EXACT structure:
    {{
      "title": "Your Survey Title",
      "message": "Your intro message for {nickname}",
      "items": [
        {{
          "product_name": "Name of Item 1",
          "question": "A fun question about Item 1?",
          "options": [
            {{"label": "Yes!", "action": "buy"}},
            {{"label": "Wait", "action": "wait"}},
            {{"label": "Delete", "action": "delete"}}
          ]
        }},
        {{
          "product_name": "Name of Item 2",
          "question": "Another question about Item 2?",
          "options": [
            {{"label": "Still want it", "action": "buy"}},
            {{"label": "Maybe later", "action": "wait"}},
            {{"label": "Remove", "action": "delete"}}
          ]
        }}
      ]
    }}
    The 'items' array in your response MUST have the same number of elements as the input.
    """

def get_motivation_prompt(data: Any) -> str:
    # БЕЗОПАСНАЯ КОНВЕРТАЦИЯ
    if hasattr(data, 'model_dump'):
        data = data.model_dump()
    elif hasattr(data, 'dict'):
        data = data.dict()
    # Если это уже dict, ничего не делаем

    return f"""
    You are a witty financial motivator.
    Event: {data.get('action')}
    User: {data.get('nickname')}
    Product: {data.get('product_name')} (Price: {data.get('price')})
    Savings Impact: {data.get('savings_delta')}

    Task: Write a short, punchy notification message (max 25 words).
    - If product_removed: Praise them for saving money!
    - If impulse_detected: Gently warn them.
    - If product_ready: Celebrate!

    Return JSON:
    {{
        "message": "Your text here"
    }}
    """

def get_parser_prompt(raw_text: str) -> str:
    safe_text = raw_text[:5000]
    return f"""
    You are a product data extractor. Analyze the provided web page text and extract the Product Name and Price.
    Page Text: {safe_text}

    Rules:
    1. Find the specific product name (not the store name).
    2. Find the current price (numeric integer only in RUB). If a range is shown, take the lowest.
    3. If multiple prices exist (discounted vs original), take the actual current price (discounted).
    4. Ignore currency symbols, return just the number.
    5. If data is missing, set found=false.

    Return ONLY valid JSON:
    {{
        "product_name": "Name",
        "price": 1000,
        "found": true
    }}
    """

def get_perplexity_prompt(url: str) -> list:
    store_hint = ""
    if "ozon" in url:
        store_hint = "Look for Ozon Card price (Ozon Карта). It is usually green."
    elif "wildberries" in url:
        store_hint = "Look for WB Wallet price (WB Кошелек). It is usually purple."
    elif "dns-shop" in url:
        store_hint = "Look for 'WygoDny KompLeKt' or Club Price."

    return [
        {"role": "system", "content": f"""
        You are a price parser. Your task is to find the ABSOLUTE LOWEST price for the product in the provided URL.
        {store_hint}
        1. Ignore original or old prices.
        2. Find the price with maximum discount (loyalty card price).
        3. If you see a price range, pick the LOWEST number.
        4. Return valid JSON only.
        """},
        {"role": "user", "content": f"URL: {url}\nExtract: \n- Name (Russian if available)\n- Price (Integer, remove spaces, e.g. 69708)\nJSON Output format: {{'product_name': 'Name', 'price': 12345, 'found': true}}"}
    ]

def get_chat_system_prompt(context: dict) -> str:
    return f"""
    You are a strict but funny financial assistant named 'Toad'.
    User: {context.get('nickname', 'User')}.
    Income: {context.get('monthly_income')}, Savings: {context.get('current_savings')}.

    Blacklisted categories: {context.get('blacklist_categories')}.

    1. If user asks about buying something from blacklist -> Refuse funny.
    2. If user asks off-topic (not finance/shopping) -> Refuse politely.
    3. Keep answers short.

    Return JSON:
    {{
        "reply": "Your answer",
        "is_refusal": boolean
    }}
    """

def get_financial_plan_prompt(data: Any) -> str:
    # БЕЗОПАСНАЯ КОНВЕРТАЦИЯ
    if hasattr(data, 'model_dump'):
        data = data.model_dump()
    elif hasattr(data, 'dict'):
        data = data.dict()

    return f"""
    Create a financial plan for {data.get('nickname')}.
    Goal: {data.get('financial_goal')} (Cost: {data.get('goal_cost')})
    Income: {data.get('monthly_income')}, Current Savings: {data.get('current_savings')}
    Expenses: {data.get('expenses_breakdown')}

    Return JSON:
    {{
        "plan_markdown": "Markdown text with analysis and advice",
        "key_steps": ["Step 1", "Step 2", "Step 3"]
    }}
    """
