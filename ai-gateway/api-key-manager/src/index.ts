/**
 * @file API Key Manager - API key rotation and scoring
 * @module @deepseek-ai/dsh-experimental-ai-gateway-api-key-manager
 */

import { AsyncContext, Service } from '@deepseek-ai/cordis';
import type { KeyMetadata, KeyManagerOptions, KeyScoreEvent } from './types.js';

export class ApiKeyManager extends Service {
  readonly name = 'aiGatewayApiKeyManager';

  private options: KeyManagerOptions;
  private keys: Map<string, KeyMetadata>;

  constructor(enableRotation: boolean = true, maxKeys: number = 5) {
    super();
    this.options = {
      enableRotation,
      maxKeys,
      scoreThreshold: 50,
      cooldownDuration: 60000,
    };
    this.keys = new Map();
  }

  mount(ctx: AsyncContext): this {
    ctx.on('dispose', () => this.dispose());
    return this;
  }

  registerKey(key: string, priority: number = 0): void {
    const id = this.hashKey(key);
    if (this.keys.size >= this.options.maxKeys) {
      this.evictLowestPriority();
    }

    this.keys.set(id, {
      id,
      keyHash: this.hashKey(key),
      status: 'healthy',
      score: 100,
      requests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rateLimits: 0,
      lastUsed: new Date(),
      cooldownUntil: null,
      priority,
    });
  }

  selectKey(request?: unknown): string | null {
    const availableKeys = Array.from(this.keys.values())
      .filter(k => k.status !== 'disabled' && !this.isInCooldown(k))
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return b.score - a.score;
      });

    if (availableKeys.length === 0) {
      return null;
    }

    const selected = availableKeys[0];
    selected.lastUsed = new Date();
    selected.requests++;
    this.keys.set(selected.id, selected);

    return selected.id;
  }

  updateKeyStatus(keyId: string, event: KeyScoreEvent): void {
    const key = this.keys.get(keyId);
    if (!key) return;

    switch (event) {
      case 'success':
        key.successfulRequests++;
        key.score = Math.min(100, key.score + 1);
        break;
      case 'failure':
        key.failedRequests++;
        key.score = Math.max(0, key.score - 5);
        break;
      case 'rateLimited':
        key.rateLimits++;
        key.score = Math.max(0, key.score - 20);
        key.status = 'rateLimited';
        key.cooldownUntil = new Date(Date.now() + this.options.cooldownDuration);
        break;
    }

    if (key.score < this.options.scoreThreshold && key.status === 'healthy') {
      key.status = 'cooldown';
      key.cooldownUntil = new Date(Date.now() + this.options.cooldownDuration);
    }

    this.keys.set(keyId, key);
  }

  getKeyStats(keyId: string): KeyMetadata | undefined {
    return this.keys.get(keyId);
  }

  getAllStats(): KeyMetadata[] {
    return Array.from(this.keys.values());
  }

  private isInCooldown(key: KeyMetadata): boolean {
    if (!key.cooldownUntil) return false;
    if (new Date() > key.cooldownUntil) {
      key.status = 'healthy';
      key.cooldownUntil = null;
      this.keys.set(key.id, key);
      return false;
    }
    return true;
  }

  private evictLowestPriority(): void {
    const entries = Array.from(this.keys.entries())
      .sort((a, b) => a[1].priority - b[1].priority);
    if (entries.length > 0) {
      this.keys.delete(entries[0][0]);
    }
  }

  private hashKey(key: string): string {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  private dispose(): void {
    this.keys.clear();
  }
}

export * from './types.js';
