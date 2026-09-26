/**
 * @file Retry Manager type definitions
 * @module @deepseek-ai/dsh-experimental-ai-gateway-retry-manager
 */

export interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterRatio: number;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalDelayMs: number;
}

export interface RetryableError extends Error {
  code?: string;
  status?: number;
  statusCode?: number;
}
