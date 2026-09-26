# @deepseek-ai/dsh-experimental-ai-gateway

Package map for the AI Gateway experimental capability: token economy, API key rotation, rate limit handling, and automatic provider fallback.

## Summary

The `ai-gateway/` group provides intelligent request routing with token optimization, multi-key rotation, and automatic failover across AI providers. It acts as a middleware layer that intercepts all model requests and applies optimization, caching, retry, and failover policies.

| Package | Role | ctx key |
|---|---|---|
| [`ai-gateway/`](../ai-gateway/README.md) | Main orchestrator package with configuration and middleware | `ctx.aiGateway` |
| [`token-manager/`](../token-manager/README.md) | Token budget enforcement and usage tracking | `ctx.aiGatewayTokenManager` |
| [`context-optimizer/`](../context-optimizer/README.md) | Context compression and filtering | `ctx.aiGatewayContextOptimizer` |
| [`prompt-optimizer/`](../prompt-optimizer/README.md) | Prompt deduplication and reduction | `ctx.aiGatewayPromptOptimizer` |
| [`cache-manager/`](../cache-manager/README.md) | Request caching with TTL | `ctx.aiGatewayCacheManager` |
| [`api-key-manager/`](../api-key-manager/README.md) | API key rotation and scoring | `ctx.aiGatewayApiKeyManager` |
| [`rate-limit-manager/`](../rate-limit-manager/README.md) | Rate limit detection and cooldown handling | `ctx.aiGatewayRateLimitManager` |
| [`retry-manager/`](../retry-manager/README.md) | Exponential backoff and retry execution | `ctx.aiGatewayRetryManager` |
| [`provider-manager/`](../provider-manager/README.md) | Multi-provider support and load balancing | `ctx.aiGatewayProviderManager` |
| [`fallback-manager/`](../fallback-manager/README.md) | Fallback chains and automatic failover | `ctx.aiGatewayFallbackManager` |
| [`usage-tracker/`](../usage-tracker/README.md) | Usage statistics and metrics | `ctx.aiGatewayUsageTracker` |
| [`logging-manager/`](../logging-manager/README.md) | Structured logging | `ctx.aiGatewayLoggingManager` |

## Architecture

```
Application
     ↓
   AI Gateway (this package)
     ↓
┌─────────────────────────────────────────┐
│ Token Manager                           │ ← Budget enforcement
│ Context Optimizer                       │ ← Context compression
│ Prompt Optimizer                        │ ← Deduplication
│ Cache Manager                           │ ← Request caching
│ API Key Manager                         │ ← Key rotation
│ Rate Limit Manager                      │ ← Cooldown handling
│ Retry Manager                           │ ← Exponential backoff
│ Provider Manager                        │ ← Load balancing
│ Fallback Manager                        │ ← Failover
│ Usage Tracker                           │ ← Statistics
│ Logging Manager                         │ ← Structured logs
└─────────────────────────────────────────┘
     ↓
LLM Service (dsh-llm)
     ↓
Provider Adapter (dsh-llm-deepseek, dsh-llm-pi-ai, etc.)
     ↓
AI Model
```

## Quick Start

```yaml
- name: '@deepseek-ai/dsh-experimental-ai-gateway'
  config:
    optimizationProfile: balanced
    enableCache: true
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
```