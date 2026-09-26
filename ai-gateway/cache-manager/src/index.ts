/**
 * @file Cache Manager - Request caching with TTL
 * @module @deepseek-ai/dsh-experimental-ai-gateway-cache-manager
 */

import { AsyncContext, Service } from '@deepseek-ai/cordis';
import type { CacheOptions, CacheEntry, CacheStats, CacheStrategy } from './types.js';

export class CacheManager extends Service {
  readonly name = 'aiGatewayCacheManager';

  private options: CacheOptions;
  private cache: Map<string, CacheEntry>;
  private stats: CacheStats;

  constructor(ttl: number = 300000, strategy: CacheStrategy = 'lru') {
    super();
    this.options = {
      ttl,
      strategy,
      maxSize: 1000,
    };
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  mount(ctx: AsyncContext): this {
    ctx.on('dispose', () => this.dispose());
    return this;
  }

  async get<T>(request: T): Promise<T | null> {
    const key = this.createKey(request);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data as T;
  }

  async set<T>(request: T, response: T): Promise<void> {
    const key = this.createKey(request);
    
    if (this.cache.size >= this.options.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      data: response,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.options.ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
    });
  }

  getStats(): CacheStats {
    return { ...this.stats, size: this.cache.size };
  }

  clear(): void {
    this.cache.clear();
  }

  private createKey<T>(request: T): string {
    const str = typeof request === 'string' ? request : JSON.stringify(request);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  private evict(): void {
    if (this.options.strategy === 'lru') {
      this.evictLRU();
    } else if (this.options.strategy === 'lfu') {
      this.evictLFU();
    } else {
      this.evictFIFO();
    }
    this.stats.evictions++;
  }

  private evictLRU(): void {
    let oldest = Date.now();
    let oldestKey = '';
    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < oldest) {
        oldest = entry.lastAccessed;
        oldestKey = key;
      }
    }
    if (oldestKey) this.cache.delete(oldestKey);
  }

  private evictLFU(): void {
    let minAccess = Infinity;
    let minKey = '';
    for (const [key, entry] of this.cache) {
      if (entry.accessCount < minAccess) {
        minAccess = entry.accessCount;
        minKey = key;
      }
    }
    if (minKey) this.cache.delete(minKey);
  }

  private evictFIFO(): void {
    const firstKey = this.cache.keys().next().value;
    if (firstKey) this.cache.delete(firstKey);
  }

  private dispose(): void {
    this.cache.clear();
  }
}

export * from './types.js';
