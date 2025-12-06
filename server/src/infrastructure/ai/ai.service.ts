import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type Json = Record<string, any>;

export interface CategorySimilarityResult {
  is_blocked: boolean;
  similarity: number;
  reason?: string;
  related_to?: string;
}

export interface PurchaseAdviceResult {
  status: 'APPROVED' | 'COOLING' | 'BLOCKED';
  key_message?: string;
  advice?: string;
}

export interface ChatResult {
  reply: string;
  is_refusal?: boolean;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly baseUrl: string;
  private readonly timeoutMs = 10000; // увеличен таймаут до 10s
  private readonly maxRetries = 2;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('AI_SERVICE_URL') ?? '';
    if (!this.baseUrl) {
      this.logger.warn(
        'AI_SERVICE_URL is not configured. AI calls will be skipped.',
      );
    } else {
      this.logger.log(`AI base URL: ${this.baseUrl}`);
    }
  }

  private async post(path: string, body: Json): Promise<Json> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (!resp.ok) {
          const text = await resp.text();
          this.logger.warn(`AI call failed ${path}: ${resp.status} ${text}`);
          lastError = new Error(`AI ${path} failed: ${resp.status}`);
        } else {
          return (await resp.json()) as Json;
        }
      } catch (err) {
        clearTimeout(timer);
        lastError = err as Error;
        this.logger.warn(
          `AI call error ${path} (attempt ${attempt + 1}/${this.maxRetries + 1}): ${lastError.message}`,
        );
      }
      // backoff 500ms * attempt (simple linear backoff)
      if (attempt < this.maxRetries)
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
    throw lastError ?? new Error('AI call failed');
  }

  async checkCategorySimilarity(
    userCategory: string,
    blacklist: string[],
  ): Promise<CategorySimilarityResult> {
    if (!this.baseUrl) throw new Error('AI_SERVICE_URL is not configured');
    // Используем стабильный эндпоинт из AI/API_DOCUMENTATION.md
    return (await this.post('/ai/category-similarity', {
      user_category: userCategory,
      blacklist_categories: blacklist,
    })) as CategorySimilarityResult;
  }

  async getPurchaseAdvice(params: {
    product_name: string;
    price: number;
    user_income: number;
    user_savings: number;
    monthly_savings: number;
    cooling_days: number;
  }): Promise<PurchaseAdviceResult> {
    if (!this.baseUrl) throw new Error('AI_SERVICE_URL is not configured');
    // Используем стабильный эндпоинт из AI/API_DOCUMENTATION.md
    return (await this.post(
      '/ai/purchase-advice',
      params,
    )) as PurchaseAdviceResult;
  }

  async chat(
    message: string,
    options?: {
      userId?: string;
      context?: Record<string, any>;
      history?: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
      }>;
    },
  ): Promise<ChatResult> {
    if (!this.baseUrl) throw new Error('AI_SERVICE_URL is not configured');
    const res = (await this.post('/ai/chat', {
      message,
      user_id: options?.userId,
      context: options?.context,
      history: options?.history,
    })) as ChatResult;
    return res;
  }
}
