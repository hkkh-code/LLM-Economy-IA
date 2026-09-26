/**
 * @file Context Optimizer type definitions
 * @module @deepseek-ai/dsh-experimental-ai-gateway-context-optimizer
 */

export type ChunkPriority = 'system' | 'instruction' | 'critical' | 'important' | 'normal' | 'low';
export type ChunkStrategy = 'relevance' | 'chronological' | 'semantic';

export interface ContextOptimizationOptions {
  maxContextSize: number;
  compressionRatio: number;
  preserveSystem: boolean;
  preserveInstructions: boolean;
  chunkStrategy: ChunkStrategy;
}

export interface ContextChunk {
  content: string;
  tokens: number;
  priority: ChunkPriority;
  canCompress: boolean;
}

export interface ContextOptimizationResult {
  original: string;
  optimized: string;
  originalTokens: number;
  optimizedTokens: number;
  savings: number;
}
