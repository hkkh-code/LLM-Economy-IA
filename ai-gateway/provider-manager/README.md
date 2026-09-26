# @deepseek-ai/dsh-experimental-ai-gateway-provider-manager

Multi-provider support and load balancing for AI Gateway.

## Role

Manages multiple AI providers with load balancing and health tracking.

## Service

- **Context key:** `ctx.aiGatewayProviderManager`
- **Class:** `ProviderManager`

## Configuration

```yaml
providerManager:
  loadBalanceStrategy: round-robin
  healthCheckInterval: 60000
```

## Usage

```typescript
import { ProviderManager } from '@deepseek-ai/dsh-experimental-ai-gateway-provider-manager';

const manager = new ProviderManager();
manager.registerProvider({
  id: 'deepseek',
  name: 'DeepSeek',
  status: 'active',
  keys: ['key1'],
  limits: { rpm: 60, tpm: 100000 },
  models: ['deepseek-chat'],
  retryPolicy: { mode: 'normal', eligibleCodes: [] },
});
const provider = manager.selectProvider('deepseek-chat');
```

## Model Experience

- Transparent to model
- Enables multi-provider deployments
- Automatic load balancing
