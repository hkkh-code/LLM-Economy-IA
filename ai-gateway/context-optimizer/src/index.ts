/**
 * @file Context Optimizer - Context compression and filtering
 * @module @deepseek-ai/dsh-experimental-ai-gateway-context-optimizer
 */

import { AsyncContext, Service } from '@deepseek-ai/cordis';
import type { ContextOptimizationOptions, ContextOptimizationResult, ContextChunk, ChunkPriority } from './types.js';

export class ContextOptimizer extends Service {
  readonly name = 'aiGatewayContextOptimizer';

  private options: ContextOptimizationOptions;

  constructor(options: Partial<ContextOptimizationOptions> = {}) {
    super();
    this.options = {
      maxContextSize: options.maxContextSize ?? 4000,
      compressionRatio: options.compressionRatio ?? 0.7,
      preserveSystem: options.preserveSystem ?? true,
      preserveInstructions: options.preserveInstructions ?? true,
      chunkStrategy: options.chunkStrategy ?? 'relevance',
    };
  }

  mount(ctx: AsyncContext): this {
    ctx.on('dispose', () => this.dispose());
    return this;
  }

  async optimize<T>(request: T, context?: AsyncContext): Promise<ContextOptimizationResult> {
    const contextStr = this.extractContext(request);
    const chunks = await this.chunkContext(contextStr);
    const prioritized = this.prioritizeChunks(chunks);
    const compressed = this.compressChunks(prioritized);

    return {
      original: contextStr,
      optimized: compressed.content,
      originalTokens: compressed.originalTokens,
      optimizedTokens: compressed.optimizedTokens,
      savings: compressed.savings,
    };
  }

  private extractContext<T>(request: T): string {
    if (typeof request === 'string') return request;
    if (request && typeof request === 'object') {
      const req = request as Record<string, unknown>;
      if ('context' in req && typeof req.context === 'string') return req.context;
      if ('messages' in req && Array.isArray(req.messages)) {
        return req.messages.map((m: { content?: string }) => m.content || '').join('\n');
      }
    }
    return '';
  }

  private async chunkContext(content: string): Promise<ContextChunk[]> {
    const lines = content.split('\n').filter(l => l.trim());
    const chunks: ContextChunk[] = [];
    let currentChunk = '';

    for (const line of lines) {
      if (this.isChunkBoundary(line)) {
        if (currentChunk.trim()) {
          chunks.push(this.createChunk(currentChunk));
        }
        currentChunk = line + '\n';
      } else {
        currentChunk += line + '\n';
      }
    }

    if (currentChunk.trim()) {
      chunks.push(this.createChunk(currentChunk));
    }

    return chunks;
  }

  private prioritizeChunks(chunks: ContextChunk[]): ContextChunk[] {
    return chunks.sort((a, b) => {
      const priorityOrder: Record<ChunkPriority, number> = {
        system: 0,
        instruction: 1,
        critical: 2,
        important: 3,
        normal: 4,
        low: 5,
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private compressChunks(chunks: ContextChunk[]): {
    content: string;
    originalTokens: number;
    optimizedTokens: number;
    savings: number;
  } {
    let content = '';
    let originalTokens = 0;
    let includedTokens = 0;

    for (const chunk of chunks) {
      originalTokens += chunk.tokens;
      if (includedTokens + chunk.tokens <= this.options.maxContextSize) {
        content += chunk.content + '\n';
        includedTokens += chunk.tokens;
      }
    }

    const savings = originalTokens > 0 ? ((originalTokens - includedTokens) / originalTokens) * 100 : 0;

    return {
      content,
      originalTokens,
      optimizedTokens: includedTokens,
      savings,
    };
  }

  private isChunkBoundary(line: string): boolean {
    const patterns = [
      /^#{1,3}\s/,       // Markdown headers
      /^system:/i,       // System markers
      /^user:/i,         // User markers
      /^assistant:/i,    // Assistant markers
    ];
    return patterns.some(p => p.test(line.trim()));
  }

  private createChunk(content: string): ContextChunk {
    const trimmed = content.trim();
    const tokens = this.estimateTokens(trimmed);
    const priority = this.determinePriority(trimmed);

    return {
      content: trimmed,
      tokens,
      priority,
      canCompress: priority !== 'system' && priority !== 'instruction',
    };
  }

  private determinePriority(content: string): ChunkPriority {
    const lower = content.toLowerCase();
    if (lower.startsWith('system:') || this.options.preserveSystem && /system|you are|your role/i.test(content)) {
      return 'system';
    }
    if (this.options.preserveInstructions && /important|must|always|never|instruction/i.test(content)) {
      return 'instruction';
    }
    if (/error|fail|critical|urgent/i.test(content)) {
      return 'critical';
    }
    if (/remember|note|warning/i.test(content)) {
      return 'important';
    }
    return 'normal';
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private dispose(): void {
    // Cleanup
  }
}

export * from './types.js';
