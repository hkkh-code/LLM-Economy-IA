/**
 * @file Rate Limit Manager - Rate limit detection and cooldown handling
 * @module @deepseek-ai/dsh-experimental-ai-gateway-rate-limit-manager
 */

import { AsyncContext, Service } from '@deepseek-ai/cordis';
import type { RateLimitOptions, RateLimitStatus, CooldownEntry } from './types.js';

export class RateLimitManager extends Service {
  readonly name = 'aiGatewayRateLimitManager';

  private options: RateLimitOptions;
  private cooldowns: Map<string, CooldownEntry>;

  constructor(cooldownDuration: number = 60000) {
    super();
    this.options = {
      cooldownDuration,
      maxRetries: 3,
      backoffMultiplier: 2,
    };
    this.cooldowns = new Map();
  }

  mount(ctx: AsyncContext): this {
    ctx.on('dispose', () => this.dispose());
    return this;
  }

  canProceed(keyId: string): boolean {
    const cooldown = this.cooldowns.get(keyId);
    if (!cooldown) return true;

    if (Date.now() > cooldown.expiresAt) {
      this.cooldowns.delete(keyId);
      return true;
    }

    return false;
  }

  recordRateLimit(keyId: string, retryAfter?: number): void {
    const duration = retryAfter ? retryAfter * 1000 : this.options.cooldownDuration;
    this.cooldowns.set(keyId, {
      keyId,
      startedAt: Date.now(),
      expiresAt: Date.now() + duration,
      reason: 'rate_limited',
    });
  }

  getStatus(keyId: string): RateLimitStatus {
    const cooldown = this.cooldowns.get(keyId);
    if (!cooldown) {
      return { isRateLimited: false, canProceed: true };
    }

    const remaining = Math.max(0, cooldown.expiresAt - Date.now());
    return {
      isRateLimited: remaining > 0,
      canProceed: remaining === 0,
      remainingMs: remaining,
      expiresAt: cooldown.expiresAt,
    };
  }

  clearCooldown(keyId: string): void {
    this.cooldowns.delete(keyId);
  }

  clearAll(): void {
    this.cooldowns.clear();
  }

  private dispose(): void {
    this.cooldowns.clear();
  }
}

export * from './types.js';
