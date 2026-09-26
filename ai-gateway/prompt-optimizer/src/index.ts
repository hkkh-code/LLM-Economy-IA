/**
 * @file Prompt Optimizer - Prompt deduplication and reduction
 * @module @deepseek-ai/dsh-experimental-ai-gateway-prompt-optimizer
 */

import { AsyncContext, Service } from '@deepseek-ai/cordis';
import type { PromptOptimizationOptions, PromptOptimizationResult } from './types.js';

export class PromptOptimizer extends Service {
  readonly name = 'aiGatewayPromptOptimizer';

  private options: PromptOptimizationOptions;

  constructor(options: Partial<PromptOptimizationOptions> = {}) {
    super();
    this.options = {
      removeRedundancy: options.removeRedundancy ?? true,
      normalizeWhitespace: options.normalizeWhitespace ?? true,
      deduplicatePatterns: options.deduplicatePatterns ?? true,
      maxPromptSize: options.maxPromptSize ?? 8000,
    };
  }

  mount(ctx: AsyncContext): this {
    ctx.on('dispose', () => this.dispose());
    return this;
  }

  async optimize<T>(request: T): Promise<PromptOptimizationResult> {
    const prompt = this.extractPrompt(request);
    const transformations: string[] = [];
    let optimized = prompt;

    if (this.options.normalizeWhitespace) {
      optimized = this.normalizeWhitespace(optimized);
      transformations.push('normalizeWhitespace');
    }

    if (this.options.deduplicatePatterns) {
      optimized = this.deduplicatePatterns(optimized);
      transformations.push('deduplicatePatterns');
    }

    if (this.options.removeRedundancy) {
      optimized = this.removeRedundancy(optimized);
      transformations.push('removeRedundancy');
    }

    return {
      original: prompt,
      optimized,
      originalTokens: this.estimateTokens(prompt),
      optimizedTokens: this.estimateTokens(optimized),
      savings: this.calculateSavings(prompt, optimized),
      transformations,
    };
  }

  private extractPrompt<T>(request: T): string {
    if (typeof request === 'string') return request;
    if (request && typeof request === 'object') {
      const req = request as Record<string, unknown>;
      if ('prompt' in req && typeof req.prompt === 'string') return req.prompt;
      if ('messages' in req && Array.isArray(req.messages)) {
        return req.messages
          .filter((m: { role?: string }) => m.role === 'user')
          .map((m: { content?: string }) => m.content || '')
          .join('\n');
      }
    }
    return '';
  }

  private normalizeWhitespace(text: string): string {
    return text
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private deduplicatePatterns(text: string): string {
    const lines = text.split('\n');
    const seen = new Set<string>();
    const result: string[] = [];

    for (const line of lines) {
      const normalized = line.trim().toLowerCase();
      if (!seen.has(normalized) || normalized.length < 10) {
        seen.add(normalized);
        result.push(line);
      }
    }

    return result.join('\n');
  }

  private removeRedundancy(text: string): string {
    return text
      .replace(/\b(please|kindly|would you|could you)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private calculateSavings(original: string, optimized: string): number {
    const originalTokens = this.estimateTokens(original);
    const optimizedTokens = this.estimateTokens(optimized);
    return originalTokens > 0 ? ((originalTokens - optimizedTokens) / originalTokens) * 100 : 0;
  }

  private dispose(): void {
    // Cleanup
  }
}

export * from './types.js';
