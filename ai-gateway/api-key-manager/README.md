# @deepseek-ai/dsh-experimental-ai-gateway-api-key-manager

API key rotation and scoring for AI Gateway.

## Role

Manages multiple API keys with automatic rotation, scoring, and cooldown handling.

## Service

- **Context key:** `ctx.aiGatewayApiKeyManager`
- **Class:** `ApiKeyManager`

## Configuration

```yaml
apiKeyManager:
  enableRotation: true
  maxKeys: 5
  scoreThreshold: 50
  cooldownDuration: 60000
```

## Usage

```typescript
import { ApiKeyManager } from '@deepseek-ai/dsh-experimental-ai-gateway-api-key-manager';

const manager = new ApiKeyManager(true, 5);
manager.registerKey('sk-xxx', 1);
const keyId = manager.selectKey();
manager.updateKeyStatus(keyId, 'success');
```

## Model Experience

- Transparent to model
- Automatic key rotation on failures
- Score-based key selection
