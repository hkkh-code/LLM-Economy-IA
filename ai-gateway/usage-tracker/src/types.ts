/**
 * @file Usage Tracker type definitions
 * @module @deepseek-ai/dsh-experimental-ai-gateway-usage-tracker
 */

export interface UsageStats {
  tokensUsedToday: number;
  tokensSavedToday: number;
  requestsToday: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimitsTriggered: number;
  activeKeys: number;
  keysInCooldown: number;
  averageTokensPerRequest: number;
  cacheHits: number;
  cacheMisses: number;
  estimatedWithoutOptimization: number;
  estimatedWithOptimization: number;
  savingPercentage: number;
}

export interface RequestRecord {
  timestamp: number;
  tokens: number;
  success: boolean;
  provider?: string;
  model?: string;
}

export interface UsageOptions {
  historyLimit: number;
  aggregationInterval: number;
}
