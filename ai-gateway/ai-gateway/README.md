---
description: "The AI Gateway experimental package: token economy, API key rotation, and intelligent request routing for DeepSeek Harness."
kind: "package-reference"
---

# @deepseek-ai/dsh-experimental-ai-gateway

English | [中文](README.zh.md)

## Summary

Mount `@deepseek-ai/dsh-experimental-ai-gateway` to add intelligent request routing with token economy, multi-key rotation, rate limit handling, and automatic fallback across multiple AI providers. It acts as a middleware layer that intercepts all model requests and applies optimization, caching, retry, and failover policies before dispatching to the underlying LLM adapters.

### When to choose it

Choose it when you want to:
- Optimize token usage across your AI workloads
- Use multiple API keys with automatic rotation
- Handle rate limits and errors gracefully
- Implement intelligent fallback across providers
- Track token consumption and savings
- Configure different optimization profiles (Performance, Balanced, Token Saver, Ultra Saver)

This package requires the base `dsh-llm` service and works alongside your existing LLM adapters.

## Table of Contents

- [Use this package](#use-this-package)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Modules](#modules)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)

-----

<a id="use-this-package"></a>
## Use this package

Mount this plugin in any composition that uses AI models and wants intelligent request management:

```yaml
- name: '@deepseek-ai/dsh-experimental-ai-gateway'
  config:
    optimizationProfile: balanced
    enableCache: true
    cacheTTL: 300000
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
```

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

## Configuration

| Field | Default | Description |
|---|---|---|
| `optimizationProfile` | `balanced` | Profile: `performance`, `balanced`, `tokenSaver`, `ultraSaver` |
| `enableCache` | `true` | Enable request caching |
| `cacheTTL` | `300000` | Cache TTL in ms |
| `cacheStrategy` | `lru` | Cache eviction: `lru`, `fifo`, `lfu` |
| `tokenBudget` | see below | Token budget limits |
| `tokenBudget.input` | `100000` | Max input tokens per request |
| `tokenBudget.output` | `30000` | Max output tokens per request |
| `tokenBudget.context` | `50000` | Max context tokens |
| `tokenBudget.reserved` | `5000` | Reserved tokens for safety |
| `tokenBudget.emergency` | `10000` | Emergency tokens for critical cases |
| `retry.maxRetries` | `3` | Maximum retry attempts |
| `retry.initialDelayMs` | `1000` | Initial backoff delay |
| `retry.maxDelayMs` | `30000` | Maximum backoff delay |
| `retry.backoffMultiplier` | `2` | Backoff multiplier |
| `retry.jitterRatio` | `0.2` | Random jitter ratio (0-1) |
| `cooldownDurationMs` | `60000` | Cooldown duration in ms |
| `enableAutoSwitch` | `true` | Enable automatic API key switching |
| `maxKeysPerProvider` | `5` | Maximum keys to track per provider |

-----

<a id="modules"></a>
## Modules

This package orchestrates multiple sub-modules, each with its own package:

| Module | Package | Role |
|---|---|---|
| Token Manager | `dsh-experimental-ai-gateway-token-manager` | Budget enforcement and token counting |
| Context Optimizer | `dsh-experimental-ai-gateway-context-optimizer` | Context compression and filtering |
| Prompt Optimizer | `dsh-experimental-ai-gateway-prompt-optimizer` | Prompt deduplication and reduction |
| Cache Manager | `dsh-experimental-ai-gateway-cache-manager` | Request caching with TTL |
| API Key Manager | `dsh-experimental-ai-gateway-api-key-manager` | Key rotation and scoring |
| Rate Limit Manager | `dsh-experimental-ai-gateway-rate-limit-manager` | Cooldown handling |
| Retry Manager | `dsh-experimental-ai-gateway-retry-manager` | Exponential backoff |
| Provider Manager | `dsh-experimental-ai-gateway-provider-manager` | Multi-provider support |
| Fallback Manager | `dsh-experimental-ai-gateway-fallback-manager` | Fallback chains |
| Usage Tracker | `dsh-experimental-ai-gateway-usage-tracker` | Statistics and metrics |
| Logging Manager | `dsh-experimental-ai-gateway-logging-manager` | Structured logging |

-----

<a id="model-experience"></a>
## Model Experience

All model requests pass through the AI Gateway with no visible changes to the model itself. The gateway:
- Reduces context size when budgets are tight
- Compresses history automatically
- Uses cache hits to avoid API calls
- Rotates API keys when limits are reached
- Retries with backoff on transient errors
- Falls back to secondary providers when needed
- Tracks all token usage and savings

The model sees exactly the same interface as before, but with optimized requests and automatic recovery from errors.

## Known Limitations and Deferred Work

- Initial release: no admin UI dashboard yet
- Cache stores in memory only (no persistence)
- No custom tokenizer support (uses heuristic estimation)
- Admin API endpoints not yet exposed
- No rate limit prediction before making requests