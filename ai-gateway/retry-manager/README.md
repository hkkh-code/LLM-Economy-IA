# @deepseek-ai/dsh-experimental-ai-gateway-retry-manager

Exponential backoff and retry execution for AI Gateway.

## Role

Handles retries with exponential backoff and jitter for failed API requests.

## Service

- **Context key:** `ctx.aiGatewayRetryManager`
- **Class:** `RetryManager`

## Configuration

```yaml
retry:
  maxRetries: 3
  initialDelayMs: 1000
  maxDelayMs: 30000
  backoffMultiplier: 2
  jitterRatio: 0.2
```

## Usage

```typescript
import { RetryManager } from '@deepseek-ai/dsh-experimental-ai-gateway-retry-manager';

const retry = new RetryManager({ maxRetries: 3 });
const result = await retry.execute(() => makeRequest());
if (!result.success) {
  console.error(`Failed after ${result.attempts} attempts`);
}
```

## Model Experience

- Transparent to model
- Automatic retry on transient failures
- Jitter prevents thundering herd
