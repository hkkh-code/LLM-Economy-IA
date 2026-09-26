/**
 * @file Token Manager - Token budget enforcement and usage tracking
 * @module @deepseek-ai/dsh-experimental-ai-gateway-token-manager
 */

import { AsyncContext, Service } from '@deepseek-ai/cordis';
import type { TokenBudget, TokenUsage, BudgetCheck, OptimizationProfile, ProfileConfig } from './types.js';
import { DEFAULT_PROFILE_CONFIGS } from './types.js';

export class TokenManager extends Service {
  readonly name = 'aiGatewayTokenManager';

  private budget: TokenBudget;
  private usage: TokenUsage;
  private profile: OptimizationProfile;
  private profileConfig: ProfileConfig;

  constructor(budget: TokenBudget, profile: OptimizationProfile = 'balanced') {
    super();
    this.budget = budget;
    this.profile = profile;
    this.profileConfig = DEFAULT_PROFILE_CONFIGS[profile];
    this.usage = { input: 0, output: 0, context: 0, total: 0 };
  }

  mount(ctx: AsyncContext): this {
    ctx.on('dispose', () => this.dispose());
    return this;
  }

  checkBudget(request: { prompt?: string; context?: string }): BudgetCheck {
    const estimatedInput = this.estimateTokens(request.prompt || '');
    const estimatedContext = this.estimateTokens(request.context || '');
    const totalEstimated = estimatedInput + estimatedContext;

    const totalBudget = this.budget.input + this.budget.context;
    const used = this.usage.input + this.usage.context;
    const remaining = totalBudget - used;

    if (remaining < totalEstimated) {
      return {
        allowed: false,
        reason: 'Insufficient budget',
        remaining,
        used,
        budget: totalBudget,
      };
    }

    const emergencyReserve = (this.budget.emergency / totalBudget) * 100;
    if (remaining - totalEstimated < this.budget.reserved) {
      return {
        allowed: false,
        reason: 'Would exceed reserved buffer',
        remaining,
        used,
        budget: totalBudget,
      };
    }

    return {
      allowed: true,
      remaining: remaining - totalEstimated,
      used,
      budget: totalBudget,
    };
  }

  recordUsage(usage: Partial<TokenUsage>): void {
    if (usage.input) this.usage.input += usage.input;
    if (usage.output) this.usage.output += usage.output;
    if (usage.context) this.usage.context += usage.context;
    this.usage.total = this.usage.input + this.usage.output + this.usage.context;
  }

  getUsage(): TokenUsage {
    return { ...this.usage };
  }

  getBudget(): TokenBudget {
    return { ...this.budget };
  }

  reset(): void {
    this.usage = { input: 0, output: 0, context: 0, total: 0 };
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  private dispose(): void {
    // Cleanup resources
  }
}

export * from './types.js';
