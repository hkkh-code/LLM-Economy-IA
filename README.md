# Harness Economy

> A simple token economy and auto-switch system for AI models

I built this because I was tired of hitting rate limits and wasting tokens. It's a modular system that helps optimize AI model usage automatically.

## What it does

- Saves tokens by optimizing context and prompts
- Avoids rate limit errors with smart cooldown handling
- Rotates API keys automatically when needed
- Falls back to different providers if one fails

## How it works

The system is split into small modules that each do one thing:

```
Your App
    ↓
AI Gateway (main orchestrator)
    ↓
├── Token Manager (track budgets)
├── Context Optimizer (compress context)
├── Prompt Optimizer (reduce prompt size)
├── Cache Manager (avoid duplicate requests)
├── API Key Manager (rotate keys)
├── Rate Limit Manager (handle 429 errors)
├── Retry Manager (exponential backoff)
├── Provider Manager (multi-provider support)
├── Fallback Manager (auto-failover)
├── Usage Tracker (stats & metrics)
└── Logging Manager (debug logs)
```

## Quick start

```bash
git clone https://github.com/hkkh-code/LLM-Economy-IA.git
cd LLM-Economy-IA
pnpm install
pnpm run build
```

Basic usage:

```typescript
import { AiGatewayService } from '@deepseek-ai/dsh-experimental-ai-gateway';

const gateway = new AiGatewayService({
  optimizationProfile: 'balanced',
  enableCache: true,
  tokenBudget: {
    input: 100000,
    output: 30000,
    context: 50000,
    reserved: 5000,
    emergency: 10000,
  },
});

gateway.mount(ctx);

// That's it - requests are now automatically optimized
const response = await ctx.llm.stream({
  prompt: "Your prompt here",
  model: "deepseek-chat",
});
```

## Modules

Each module is in its own package under `ai-gateway/`:

- `token-manager` - Budget tracking and enforcement
- `context-optimizer` - Compress context by chunking and prioritizing
- `prompt-optimizer` - Remove duplicate/redundant text from prompts
- `cache-manager` - Cache responses with LRU/FIFO/LFU strategies
- `api-key-manager` - Rotate API keys and track their health
- `rate-limit-manager` - Handle 429 errors and cooldown periods
- `retry-manager` - Exponential backoff with jitter
- `provider-manager` - Manage multiple AI providers
- `fallback-manager` - Automatic failover between providers
- `usage-tracker` - Track token usage and savings
- `logging-manager` - Structured logging for debugging
- `admin-ui` - Simple admin interface for monitoring

## Optimization profiles

I added 4 profiles that tune how aggressive the optimization is:

- `performance` - Speed over savings (~10% token reduction)
- `balanced` - Middle ground (~25% reduction)
- `tokenSaver` - Prioritize savings (~40% reduction)
- `ultraSaver` - Maximum savings (~60% reduction)

Pick based on your needs. I usually use `balanced` for dev and `tokenSaver` for production.

## Full config example

```yaml
- name: '@deepseek-ai/dsh-experimental-ai-gateway'
  config:
    optimizationProfile: balanced
    enableCache: true
    cacheTTL: 300000
    cacheStrategy: lru
    tokenBudget:
      input: 100000
      output: 30000
      context: 50000
      reserved: 5000
      emergency: 10000
    retry:
      maxRetries: 3
      initialDelayMs: 1000
      maxDelayMs: 30000
      backoffMultiplier: 2
      jitterRatio: 0.2
    cooldownDurationMs: 60000
    enableAutoSwitch: true
    maxKeysPerProvider: 5
```

Check `docs/CONFIGURATION.md` for all options.

## Monitoring

```typescript
const stats = usageTracker.getStats();

console.log(`Tokens used today: ${stats.tokensUsedToday}`);
console.log(`Tokens saved: ${stats.tokensSavedToday}`);
console.log(`Savings: ${stats.savingPercentage}%`);
console.log(`Cache hit rate: ${(stats.cacheHits / (stats.cacheHits + stats.cacheMisses) * 100).toFixed(1)}%`);
```

See `examples/monitoring.ts` for more.

## Project structure

```
ai-gateway/
├── ai-gateway/          # Main orchestrator
├── token-manager/       # Token budget tracking
├── context-optimizer/   # Context compression
├── prompt-optimizer/    # Prompt reduction
├── cache-manager/       # Response caching
├── api-key-manager/     # Key rotation
├── rate-limit-manager/  # Rate limit handling
├── retry-manager/       # Retry with backoff
├── provider-manager/    # Multi-provider support
├── fallback-manager/    # Auto-failover
├── usage-tracker/       # Usage stats
├── logging-manager/     # Debug logging
└── admin-ui/            # Admin interface
```

## Running tests

```bash
pnpm run test
pnpm run test:coverage  # with coverage report
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT - do whatever you want with it.

## Links

- [DeepSeek Harness](https://github.com/deepseek-ai/harness)
- [Cordis docs](https://cordis.js.org)
- [DeepSeek API](https://platform.deepseek.com)

---

Built this for my own use, figured others might find it helpful too.
