# @deepseek-ai/dsh-experimental-ai-gateway-cache-manager

Request caching with TTL for AI Gateway.

## Role

Caches API responses to avoid redundant requests. Supports LRU, FIFO, and LFU eviction strategies.

## Service

- **Context key:** `ctx.aiGatewayCacheManager`
- **Class:** `CacheManager`

## Configuration

```yaml
cache:
  ttl: 300000        # 5 minutes
  strategy: lru      # Eviction strategy
  maxSize: 1000      # Max entries
```

## Usage

```typescript
import { CacheManager } from '@deepseek-ai/dsh-experimental-ai-gateway-cache-manager';

const cache = new CacheManager(300000, 'lru');
const cached = await cache.get(request);
if (!cached) {
  const response = await makeRequest();
  await cache.set(request, response);
}
```

## Model Experience

- Transparent to model
- Reduces duplicate API calls
- Improves response time for repeated queries
