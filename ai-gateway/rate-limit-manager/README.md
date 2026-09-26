# @deepseek-ai/dsh-experimental-ai-gateway-rate-limit-manager

Rate limit detection and cooldown handling for AI Gateway.

## Role

Monitors rate limits, manages cooldown periods, and coordinates with key rotation.

## Service

- **Context key:** `ctx.aiGatewayRateLimitManager`
- **Class:** `RateLimitManager`

## Configuration

```yaml
rateLimitManager:
  cooldownDuration: 60000
  maxRetries: 3
  backoffMultiplier: 2
```

## Usage

```typescript
import { RateLimitManager } from '@deepseek-ai/dsh-experimental-ai-gateway-rate-limit-manager';

const manager = new RateLimitManager(60000);
if (manager.canProceed(keyId)) {
  await makeRequest();
}
manager.recordRateLimit(keyId);
```

## Model Experience

- Transparent to model
- Prevents 429 errors through proactive cooldown
- Coordinates with API key rotation
