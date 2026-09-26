# @deepseek-ai/dsh-experimental-ai-gateway-token-manager

Token budget enforcement and usage tracking for AI Gateway.

## Role

Manages token budgets across input, output, context, reserved, and emergency pools. Enforces limits and tracks usage in real-time.

## Service

- **Context key:** `ctx.aiGatewayTokenManager`
- **Class:** `TokenManager`

## Configuration

```yaml
tokenBudget:
  input: 100000      # Max input tokens
  output: 30000      # Max output tokens
  context: 50000     # Max context tokens
  reserved: 5000     # Reserved buffer
  emergency: 10000   # Emergency pool
```

## Usage

```typescript
import { TokenManager } from '@deepseek-ai/dsh-experimental-ai-gateway-token-manager';

const manager = new TokenManager(config, 'balanced');
const check = manager.checkBudget(prompt);
if (!check.allowed) {
  throw new Error('Budget exceeded');
}
```

## Model Experience

- No model-visible effects
- Tracks token usage for optimization profiles
- Provides budget enforcement for request preprocessing
