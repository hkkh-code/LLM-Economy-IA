/**
 * @file Fallback Manager - Fallback chains and automatic failover
 * @module @deepseek-ai/dsh-experimental-ai-gateway-fallback-manager
 */

import { AsyncContext, Service } from '@deepseek-ai/cordis';
import type { FallbackChain, FallbackResult, FallbackConfig } from './types.js';

export class FallbackManager extends Service {
  readonly name = 'aiGatewayFallbackManager';

  private config: FallbackConfig;
  private chains: Map<string, FallbackChain>;

  constructor() {
    super();
    this.config = {
      defaultChain: ['primary', 'secondary', 'fallback', 'emergency'],
      maxFallbackDepth: 4,
      enableAutomaticFallback: true,
    };
    this.chains = new Map();
  }

  mount(ctx: AsyncContext): this {
    ctx.on('dispose', () => this.dispose());
    return this;
  }

  registerChain(name: string, chain: FallbackChain): void {
    this.chains.set(name, chain);
  }

  async executeWithFallback<T>(
    operation: (provider: string) => Promise<T>,
    chainName: string = 'default'
  ): Promise<FallbackResult<T>> {
    const chain = this.chains.get(chainName) || this.getDefaultChain();
    const attempts: Array<{ provider: string; error?: Error }> = [];
    const startTime = Date.now();

    for (const provider of chain.providers) {
      try {
        const result = await operation(provider);
        return {
          success: true,
          result,
          usedProvider: provider,
          attempts,
          totalFallbacks: attempts.length,
          totalMs: Date.now() - startTime,
        };
      } catch (error) {
        attempts.push({ provider, error: error as Error });
        if (!this.config.enableAutomaticFallback) {
          break;
        }
      }
    }

    return {
      success: false,
      attempts,
      totalFallbacks: attempts.length,
      totalMs: Date.now() - startTime,
    };
  }

  getChain(name: string): FallbackChain | undefined {
    return this.chains.get(name);
  }

  private getDefaultChain(): FallbackChain {
    return {
      name: 'default',
      providers: this.config.defaultChain,
    };
  }

  private dispose(): void {
    this.chains.clear();
  }
}

export * from './types.js';
