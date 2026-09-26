# @deepseek-ai/dsh-experimental-ai-gateway-admin-ui

Administrative UI for AI Gateway monitoring and configuration.

## Role

Provides a programmatic interface for monitoring and managing the AI Gateway system.

## Service

- **Context key:** `ctx.aiGatewayAdminUI`
- **Class:** `AdminUIService`

## Configuration

```yaml
adminUI:
  enableDashboard: true
  refreshInterval: 5000
  port: 3001
```

## Usage

```typescript
import { AdminUIService } from '@deepseek-ai/dsh-experimental-ai-gateway-admin-ui';

const admin = new AdminUIService();
const stats = admin.getSystemStats();
console.log(`Active keys: ${stats.activeKeys}`);
console.log(`Tokens saved: ${stats.tokensSaved}`);
```

## Model Experience

- Administrative interface only
- No model-visible effects
- Provides observability and control
