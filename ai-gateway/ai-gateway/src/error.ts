/**
 * @file AI Gateway error types
 * @module @deepseek-ai/dsh-experimental-ai-gateway
 */

export class AiGatewayError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'AiGatewayError';
  }
}

export class BudgetExceededError extends AiGatewayError {
  constructor(message = 'Token budget exceeded') {
    super(message, 'BUDGET_EXCEEDED');
  }
}

export class RateLimitError extends AiGatewayError {
  constructor(public readonly retryAfter: number | null = null) {
    super('Rate limit exceeded', 'RATE_LIMIT');
  }
}

export class NoKeysAvailableError extends AiGatewayError {
  constructor(message = 'No available API keys') {
    super(message, 'NO_KEYS');
  }
}

export class CooldownError extends AiGatewayError {
  constructor(public readonly cooldownUntil: Date) {
    super('API key is in cooldown', 'COOLDOWN');
  }
}

export class CacheMissError extends AiGatewayError {
  constructor(message = 'Cache miss') {
    super(message, 'CACHE_MISS');
  }
}

export class ContextOptimizationError extends AiGatewayError {
  constructor(message = 'Context optimization failed') {
    super(message, 'CONTEXT_OPTIMIZATION_FAILED');
  }
}