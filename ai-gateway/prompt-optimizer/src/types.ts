/**
 * @file Prompt Optimizer type definitions
 * @module @deepseek-ai/dsh-experimental-ai-gateway-prompt-optimizer
 */

export interface PromptOptimizationOptions {
  removeRedundancy: boolean;
  normalizeWhitespace: boolean;
  deduplicatePatterns: boolean;
  maxPromptSize: number;
}

export interface PromptOptimizationResult {
  original: string;
  optimized: string;
  originalTokens: number;
  optimizedTokens: number;
  savings: number;
  transformations: string[];
}
