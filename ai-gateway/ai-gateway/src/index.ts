/**
 * @file AI Gateway - Main entry point for the token economy and auto-switch system
 * @module @deepseek-ai/dsh-experimental-ai-gateway
 */

import { AsyncContext, Effect, Service } from '@deepseek-ai/cordis';
import { TokenManager } from '../token-manager/src/index.js';
import { ContextOptimizer } from '../context-optimizer/src/index.js';
import { PromptOptimizer } from '../prompt-optimizer/src/index.js';
import { CacheManager } from '../cache-manager/src/index.js';
import { ApiKeyManager } from '../api-key-manager/src/index.js';
import { RateLimitManager } from '../rate-limit-manager/src/index.js';
import { RetryManager } from '../retry-manager/src/index.js';
import { ProviderManager } from '../provider-manager/src/index.js';
import { FallbackManager } from '../fallback-manager/src/index.js';
import { UsageTracker } from '../usage-tracker/src/index.js';
import { LoggingManager } from '../logging-manager/src/index.js';

export interface AiGatewayConfig {
  optimizationProfile?: 'performance' | 'balanced' | 'tokenSaver' | 'ultraSaver';
  enableCache?: boolean;
  cacheTTL?: number;
  cacheStrategy?: 'lru' | 'fifo' | 'lfu';
  tokenBudget?: {
    input?: number;
    output?: number;
    context?: number;
    reserved?: number;
    emergency?: number;
  };
  retry?: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffMultiplier?: number;
    jitterRatio?: number;
  };
  cooldownDurationMs?: number;
  enableAutoSwitch?: boolean;
  maxKeysPerProvider?: number;
}

const DEFAULT_CONFIG: AiGatewayConfig = {
  optimizationProfile: 'balanced',
  enableCache: true,
  cacheTTL: 300000,
  cacheStrategy: 'lru',
  tokenBudget: {
    input: 100000,
    output: 30000,
    context: 50000,
    reserved: 5000,
    emergency: 10000,
  },
  retry: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitterRatio: 0.2,
  },
  cooldownDurationMs: 60000,
  enableAutoSwitch: true,
  maxKeysPerProvider: 5,
};

export class AiGatewayService extends Service {
  readonly name = 'aiGateway';

  private config: AiGatewayConfig;
  private tokenManager: TokenManager | null = null;
  private contextOptimizer: ContextOptimizer | null = null;
  private promptOptimizer: PromptOptimizer | null = null;
  private cacheManager: CacheManager | null = null;
  private apiKeyManager: ApiKeyManager | null = null;
  private rateLimitManager: RateLimitManager | null = null;
  private retryManager: RetryManager | null = null;
  private providerManager: ProviderManager | null = null;
  private fallbackManager: FallbackManager | null = null;
  private usageTracker: UsageTracker | null = null;
  private loggingManager: LoggingManager | null = null;

  constructor(config: AiGatewayConfig = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  mount(ctx: AsyncContext): void {
    // Mount sub-modules
    if (this.config.enableCache) {
      this.cacheManager = ctx.effect(() => new CacheManager(this.config.cacheTTL!, this.config.cacheStrategy!).mount(ctx));
    }

    this.apiKeyManager = ctx.effect(() => new ApiKeyManager(this.config.enableAutoSwitch!, this.config.maxKeysPerProvider!).mount(ctx));
    this.rateLimitManager = ctx.effect(() => new RateLimitManager(this.config.cooldownDurationMs!).mount(ctx));
    this.retryManager = ctx.effect(() => new RetryManager(this.config.retry!).mount(ctx));
    this.providerManager = ctx.effect(() => new ProviderManager().mount(ctx));
    this.fallbackManager = ctx.effect(() => new FallbackManager().mount(ctx));
    this.usageTracker = ctx.effect(() => new UsageTracker().mount(ctx));
    this.loggingManager = ctx.effect(() => new LoggingManager().mount(ctx));
    this.tokenManager = ctx.effect(() => new TokenManager(this.config.tokenBudget!, this.config.optimizationProfile!).mount(ctx));
    this.contextOptimizer = ctx.effect(() => new ContextOptimizer().mount(ctx));
    this.promptOptimizer = ctx.effect(() => new PromptOptimizer().mount(ctx));

    // Register middleware for LLM requests
    ctx.llm.stream = this.createMiddleware(ctx.llm.stream.bind(ctx.llm));
  }

  async processRequest<T>(request: T, context: AsyncContext): Promise<T> {
    // Log start
    this.loggingManager?.log('Request received', { type: 'request_start' });

    // Optimize context
    const optimizedContext = await this.contextOptimizer?.optimize(request, context);
    
    // Check cache
    const cacheResult = await this.cacheManager?.get(request);
    if (cacheResult) {
      this.loggingManager?.log('Cache hit', { type: 'cache_hit' });
      return cacheResult;
    }

    // Optimize prompt
    const optimizedPrompt = await this.promptOptimizer?.optimize(request);

    // Check token budget
    const budgetCheck = this.tokenManager?.checkBudget(optimizedPrompt);
    if (!budgetCheck.allowed) {
      this.loggingManager?.log('Budget exceeded', { type: 'budget_exceeded' });
      throw new Error('Token budget exceeded');
    }

    // Select API key
    const selectedKey = this.apiKeyManager?.selectKey(request);
    if (!selectedKey) {
      this.loggingManager?.log('No available keys', { type: 'no_keys' });
      throw new Error('No available API keys');
    }

    // Check rate limits
    const canProceed = this.rateLimitManager?.canProceed(selectedKey);
    if (!canProceed) {
      this.loggingManager?.log('Rate limited', { type: 'rate_limited' });
      throw new Error('Rate limit exceeded');
    }

    this.loggingManager?.log('Request ready', { type: 'request_ready' });

    return request;
  }

  private createMiddleware(originalStream: any) {
    return async (options: any, context: AsyncContext) => {
      // Pre-process request
      const processedRequest = await this.processRequest(options, context);

      // Call original stream
      const stream = await originalStream(processedRequest, context);

      // Post-process response
      this.usageTracker?.trackUsage(stream, context);

      return stream;
    };
  }
}

export function applyAiGateway(ctx: AsyncContext, config: AiGatewayConfig = {}) {
  ctx.effect(() => new AiGatewayService(config).mount(ctx));
}