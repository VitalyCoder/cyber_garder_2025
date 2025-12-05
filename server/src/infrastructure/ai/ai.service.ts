import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type Json = Record<string, any>;

export interface CategorySimilarityResult {
  is_blocked: boolean;
  similarity: number;
  reason?: string;
}

export interface PurchaseAdviceResult {
  status: 'APPROVED' | 'COOLING' | 'BLOCKED';
  key_message?: string;
  advice?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly baseUrl: string;
  private readonly timeoutMs = 4000;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('AI_SERVICE_URL') ?? '';
  }

  private async post(path: string, body: Json): Promise<Json> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
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
        throw new Error(`AI ${path} failed: ${resp.status}`);
      }
      return (await resp.json()) as Json;
    } catch (err) {
      clearTimeout(timer);
      this.logger.warn(`AI call error ${path}: ${(err as Error).message}`);
      throw err;
    }
  }

  async checkCategorySimilarity(
    userCategory: string,
    blacklist: string[],
  ): Promise<CategorySimilarityResult> {
    if (!this.baseUrl) throw new Error('AI_SERVICE_URL is not configured');
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
    return (await this.post(
      '/ai/purchase-advice',
      params,
    )) as PurchaseAdviceResult;
  }
}
