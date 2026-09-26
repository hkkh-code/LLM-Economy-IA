/**
 * @file Retry Manager - Exponential backoff and retry execution
 * @module @deepseek-ai/dsh-experimental-ai-gateway-retry-manager
 */

import { AsyncContext, Service } from '@deepseek-ai/cordis';
import type { RetryOptions, RetryResult, RetryableError } from './types.js';

export class RetryManager extends Service {
  readonly name = 'aiGatewayRetryManager';

  private options: RetryOptions;

  constructor(options: Partial<RetryOptions> = {}) {
    super();
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      initialDelayMs: options.initialDelayMs ?? 1000,
      maxDelayMs: options.maxDelayMs ?? 30000,
      backoffMultiplier: options.backoffMultiplier ?? 2,
      jitterRatio: options.jitterRatio ?? 0.2,
    };
  }

  mount(ctx: AsyncContext): this {
    ctx.on('dispose', () => this.dispose());
    return this;
  }

  async execute<T>(
    operation: () => Promise<T>,
    isRetryable: (error: Error) => boolean = this.defaultIsRetryable
  ): Promise<RetryResult<T>> {
    let lastError: Error | null = null;
    let attempt = 0;
    const startTime = Date.now();

    while (attempt <= this.options.maxRetries) {
      try {
        const result = await operation();
        return {
          success: true,
          result,
          attempts: attempt + 1,
          totalDelayMs: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error as Error;
        
        if (!isRetryable(lastError) || attempt >= this.options.maxRetries) {
          break;
        }

        const delay = this.calculateDelay(attempt);
        await this.sleep(delay);
        attempt++;
      }
    }

    return {
      success: false,
      error: lastError!,
      attempts: attempt,
      totalDelayMs: Date.now() - startTime,
    };
  }

  private calculateDelay(attempt: number): number {
    const baseDelay = this.options.initialDelayMs * Math.pow(this.options.backoffMultiplier, attempt);
    const delay = Math.min(baseDelay, this.options.maxDelayMs);
    const jitter = delay * this.options.jitterRatio * (Math.random() * 2 - 1);
    return Math.max(0, Math.floor(delay + jitter));
  }

  private defaultIsRetryable(error: Error): boolean {
    const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN'];
    const retryableStatuses = [429, 500, 502, 503, 504];
    
    const err = error as RetryableError;
    return (
      retryableCodes.includes(err.code) ||
      (err.status && retryableStatuses.includes(err.status)) ||
      (err.statusCode && retryableStatuses.includes(err.statusCode))
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private dispose(): void {
    // Cleanup
  }
}

export * from './types.js';
