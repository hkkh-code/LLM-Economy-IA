# @deepseek-ai/dsh-experimental-ai-gateway-prompt-optimizer

Prompt deduplication and reduction for AI Gateway.

## Role

Optimizes prompts by removing redundancy, normalizing whitespace, and deduplicating patterns while preserving meaning.

## Service

- **Context key:** `ctx.aiGatewayPromptOptimizer`
- **Class:** `PromptOptimizer`

## Configuration

```yaml
promptOptimizer:
  removeRedundancy: true
  normalizeWhitespace: true
  deduplicatePatterns: true
  maxPromptSize: 8000
```

## Usage

```typescript
import { PromptOptimizer } from '@deepseek-ai/dsh-experimental-ai-gateway-prompt-optimizer';

const optimizer = new PromptOptimizer({ removeRedundancy: true });
const result = await optimizer.optimize(prompt);
console.log(`Saved ${result.savings}% tokens`);
```

## Model Experience

- No model-visible behavior changes
- Reduces token count while preserving intent
- Improves efficiency without quality loss
