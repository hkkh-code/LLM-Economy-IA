/**
 * @file Usage Tracker - Usage statistics and metrics
 * @module @deepseek-ai/dsh-experimental-ai-gateway-usage-tracker
 */

import { AsyncContext, Service } from '@deepseek-ai/cordis';
import type { UsageStats, RequestRecord, UsageOptions } from './types.js';

export class UsageTracker extends Service {
  readonly name = 'aiGatewayUsageTracker';

  private options: UsageOptions;
  private stats: UsageStats;
  private history: RequestRecord[];

  constructor() {
    super();
    this.options = {
      historyLimit: 1000,
      aggregationInterval: 3600000, // 1 hour
    };
    this.stats = this.createEmptyStats();
    this.history = [];
  }

  mount(ctx: AsyncContext): this {
    ctx.on('dispose', () => this.dispose());
    return this;
  }

  trackUsage(response: unknown, context?: AsyncContext): void {
    const usage = this.extractUsage(response);
    if (!usage) return;

    this.stats.tokensUsedToday += usage.totalTokens;
    this.stats.requestsToday++;
    
    if (usage.success) {
      this.stats.successfulRequests++;
    } else {
      this.stats.failedRequests++;
    }

    this.stats.averageTokensPerRequest = 
      this.stats.tokensUsedToday / this.stats.requestsToday;

    this.addToHistory({
      timestamp: Date.now(),
      tokens: usage.totalTokens,
      success: usage.success,
      provider: usage.provider,
      model: usage.model,
    });
  }

  recordTokenSavings(saved: number): void {
    this.stats.tokensSavedToday += saved;
    this.updateSavingsPercentage();
  }

  recordCacheHit(): void {
    this.stats.cacheHits++;
  }

  recordCacheMiss(): void {
    this.stats.cacheMisses++;
  }

  getStats(): UsageStats {
    return { ...this.stats };
  }

  getHistory(limit?: number): RequestRecord[] {
    const records = limit ? this.history.slice(-limit) : this.history;
    return [...records];
  }

  reset(): void {
    this.stats = this.createEmptyStats();
    this.history = [];
  }

  private extractUsage(response: unknown): {
    totalTokens: number;
    success: boolean;
    provider?: string;
    model?: string;
  } | null {
    if (!response || typeof response !== 'object') return null;

    const resp = response as Record<string, unknown>;
    const usage = resp.usage as Record<string, number> | undefined;

    return {
      totalTokens: usage?.total_tokens ?? usage?.totalTokens ?? 0,
      success: true,
      provider: resp.provider as string | undefined,
      model: resp.model as string | undefined,
    };
  }

  private addToHistory(record: RequestRecord): void {
    this.history.push(record);
    if (this.history.length > this.options.historyLimit) {
      this.history.shift();
    }
  }

  private updateSavingsPercentage(): void {
    const total = this.stats.estimatedWithoutOptimization;
    if (total > 0) {
      this.stats.savingPercentage = 
        (this.stats.tokensSavedToday / total) * 100;
    }
  }

  private createEmptyStats(): UsageStats {
    return {
      tokensUsedToday: 0,
      tokensSavedToday: 0,
      requestsToday: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rateLimitsTriggered: 0,
      activeKeys: 0,
      keysInCooldown: 0,
      averageTokensPerRequest: 0,
      cacheHits: 0,
      cacheMisses: 0,
      estimatedWithoutOptimization: 0,
      estimatedWithOptimization: 0,
      savingPercentage: 0,
    };
  }

  private dispose(): void {
    this.history = [];
  }
}

export * from './types.js';
