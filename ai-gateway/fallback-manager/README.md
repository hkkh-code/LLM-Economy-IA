# @deepseek-ai/dsh-experimental-ai-gateway-fallback-manager

Fallback chains and automatic failover for AI Gateway.

## Role

Manages fallback chains for automatic failover when primary providers fail.

## Service

- **Context key:** `ctx.aiGatewayFallbackManager`
- **Class:** `FallbackManager`

## Configuration

```yaml
fallbackManager:
  defaultChain:
    - primary
    - secondary
    - fallback
    - emergency
  maxFallbackDepth: 4
  enableAutomaticFallback: true
```

## Usage

```typescript
import { FallbackManager } from '@deepseek-ai/dsh-experimental-ai-gateway-fallback-manager';

const manager = new FallbackManager();
const result = await manager.executeWithFallback(async (provider) => {
  return await makeRequest(provider);
});
if (!result.success) {
  console.error(`All ${result.attempts.length} providers failed`);
}
```

## Model Experience

- Transparent to model
- Automatic failover maintains availability
- Logs fallback events for monitoring
