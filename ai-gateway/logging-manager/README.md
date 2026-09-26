# @deepseek-ai/dsh-experimental-ai-gateway-logging-manager

Structured logging for AI Gateway.

## Role

Provides structured logging for all AI Gateway operations with configurable log levels.

## Service

- **Context key:** `ctx.aiGatewayLoggingManager`
- **Class:** `LoggingManager`

## Configuration

```yaml
loggingManager:
  level: info
  maxEntries: 1000
  includeTimestamp: true
```

## Usage

```typescript
import { LoggingManager } from '@deepseek-ai/dsh-experimental-ai-gateway-logging-manager';

const logger = new LoggingManager();
logger.log('Request received', { type: 'request_start' });
logger.warn('Rate limit approaching', { keyId: 'xxx' });
logger.error('Request failed', { error: err.message });
```

## Model Experience

- Transparent to model
- Provides observability for debugging
- Structured logs support monitoring systems
