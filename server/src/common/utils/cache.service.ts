export class CacheService {
  private static instance: CacheService;
  private data = new Map<string, unknown>();

  constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public set<T>(key: string, value: T): void {
    this.data.set(key, value);
  }

  public has(key: string): boolean {
    return this.data.has(key);
  }

  public get<T>(key: string): T | undefined {
    return this.data.get(key) as T;
  }

  public delete(key: string): void {
    this.data.delete(key);
  }
}
