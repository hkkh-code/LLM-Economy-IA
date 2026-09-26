# @deepseek-ai/dsh-experimental-ai-gateway-context-optimizer

Context compression and filtering for AI Gateway.

## Role

Optimizes context by chunking, prioritizing, and compressing content while preserving critical information.

## Service

- **Context key:** `ctx.aiGatewayContextOptimizer`
- **Class:** `ContextOptimizer`

## Configuration

```yaml
contextOptimizer:
  maxContextSize: 4000      # Max context tokens
  compressionRatio: 0.7     # Target compression ratio
  preserveSystem: true      # Keep system messages
  preserveInstructions: true # Keep instruction markers
  chunkStrategy: relevance  # Chunking strategy
```

## Usage

```typescript
import { ContextOptimizer } from '@deepseek-ai/dsh-experimental-ai-gateway-context-optimizer';

const optimizer = new ContextOptimizer({ maxContextSize: 4000 });
const result = await optimizer.optimize(request);
console.log(`Saved ${result.savings}% tokens`);
```

## Model Experience

- No model-visible effects during compression
- Preserves system and instruction content
- Reduces context tokens sent to model
