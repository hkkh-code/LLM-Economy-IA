/**
 * @file AI Gateway type definitions
 * @module @deepseek-ai/dsh-experimental-ai-gateway
 */

export type OptimizationProfile = 'performance' | 'balanced' | 'tokenSaver' | 'ultraSaver';

export interface TokenBudget {
  input: number;
  output: number;
  context: number;
  reserved: number;
  emergency: number;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterRatio: number;
}

export interface CacheConfig {
  ttl: number;
  strategy: 'lru' | 'fifo' | 'lfu';
  maxSize: number;
}

export interface KeyMetadata {
  id: string;
  keyHash: string;
  status: 'healthy' | 'rateLimited' | 'cooldown' | 'disabled';
  score: number;
  requests: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimits: number;
  lastUsed: Date;
  cooldownUntil: Date | null;
  priority: number;
}

export interface ProviderInfo {
  id: string;
  name: string;
  status: 'active' | 'disabled';
  keys: string[];
  limits: {
    rpm: number;
    tpm: number;
  };
  models: string[];
  retryPolicy: {
    mode: 'normal' | 'always';
    eligibleCodes: string[];
  };
}

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

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  module: string;
  message: string;
  data: Record<string, unknown>;
}