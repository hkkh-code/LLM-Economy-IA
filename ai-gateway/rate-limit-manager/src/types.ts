/**
 * @file Rate Limit Manager type definitions
 * @module @deepseek-ai/dsh-experimental-ai-gateway-rate-limit-manager
 */

export interface RateLimitOptions {
  cooldownDuration: number;
  maxRetries: number;
  backoffMultiplier: number;
}

export interface RateLimitStatus {
  isRateLimited: boolean;
  canProceed: boolean;
  remainingMs?: number;
  expiresAt?: number;
}

export interface CooldownEntry {
  keyId: string;
  startedAt: number;
  expiresAt: number;
  reason: string;
}
