# @deepseek-ai/dsh-experimental-ai-gateway-usage-tracker

Usage statistics and metrics for AI Gateway.

## Role

Tracks token usage, request counts, cache hits/misses, and optimization savings.

## Service

- **Context key:** `ctx.aiGatewayUsageTracker`
- **Class:** `UsageTracker`

## Configuration

```yaml
usageTracker:
  historyLimit: 1000
  aggregationInterval: 3600000
```

## Usage

```typescript
import { UsageTracker } from '@deepseek-ai/dsh-experimental-ai-gateway-usage-tracker';

const tracker = new UsageTracker();
tracker.trackUsage(response);
tracker.recordTokenSavings(100);

const stats = tracker.getStats();
console.log(`Tokens saved: ${stats.tokensSavedToday}`);
```

## Model Experience

- Transparent to model
- Provides observability for optimization
- Supports reporting and analytics
