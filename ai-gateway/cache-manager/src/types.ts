/**
 * @file Cache Manager type definitions
 * @module @deepseek-ai/dsh-experimental-ai-gateway-cache-manager
 */

export type CacheStrategy = 'lru' | 'fifo' | 'lfu';

export interface CacheOptions {
  ttl: number;
  strategy: CacheStrategy;
  maxSize: number;
}

export interface CacheEntry {
  data: unknown;
  createdAt: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size?: number;
}
