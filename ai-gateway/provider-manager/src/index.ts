/**
 * @file Provider Manager - Multi-provider support and load balancing
 * @module @deepseek-ai/dsh-experimental-ai-gateway-provider-manager
 */

import { AsyncContext, Service } from '@deepseek-ai/cordis';
import type { ProviderInfo, ProviderOptions, ProviderStatus } from './types.js';

export class ProviderManager extends Service {
  readonly name = 'aiGatewayProviderManager';

  private options: ProviderOptions;
  private providers: Map<string, ProviderInfo>;

  constructor() {
    super();
    this.options = {
      loadBalanceStrategy: 'round-robin',
      healthCheckInterval: 60000,
    };
    this.providers = new Map();
  }

  mount(ctx: AsyncContext): this {
    ctx.on('dispose', () => this.dispose());
    return this;
  }

  registerProvider(info: ProviderInfo): void {
    this.providers.set(info.id, info);
  }

  getProvider(id: string): ProviderInfo | undefined {
    return this.providers.get(id);
  }

  getActiveProviders(): ProviderInfo[] {
    return Array.from(this.providers.values()).filter(p => p.status === 'active');
  }

  selectProvider(model?: string): ProviderInfo | null {
    const active = this.getActiveProviders();
    if (active.length === 0) return null;

    if (model) {
      const matching = active.filter(p => p.models.includes(model));
      if (matching.length > 0) {
        return matching[0];
      }
    }

    if (this.options.loadBalanceStrategy === 'round-robin') {
      return active[Math.floor(Math.random() * active.length)];
    }

    return active[0];
  }

  updateProviderStatus(id: string, status: ProviderStatus): void {
    const provider = this.providers.get(id);
    if (provider) {
      provider.status = status;
    }
  }

  private dispose(): void {
    this.providers.clear();
  }
}

export * from './types.js';
