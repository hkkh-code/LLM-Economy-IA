/**
 * @file Fallback Manager type definitions
 * @module @deepseek-ai/dsh-experimental-ai-gateway-fallback-manager
 */

export interface FallbackChain {
  name: string;
  providers: string[];
}

export interface FallbackResult<T> {
  success: boolean;
  result?: T;
  usedProvider?: string;
  attempts: Array<{ provider: string; error?: Error }>;
  totalFallbacks: number;
  totalMs: number;
}

export interface FallbackConfig {
  defaultChain: string[];
  maxFallbackDepth: number;
  enableAutomaticFallback: boolean;
}
