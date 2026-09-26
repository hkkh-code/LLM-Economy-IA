/**
 * @file Logging Manager - Structured logging for AI Gateway
 * @module @deepseek-ai/dsh-experimental-ai-gateway-logging-manager
 */

import { AsyncContext, Service } from '@deepseek-ai/cordis';
import type { LogEntry, LogLevel, LoggingOptions } from './types.js';

export class LoggingManager extends Service {
  readonly name = 'aiGatewayLoggingManager';

  private options: LoggingOptions;
  private entries: LogEntry[];

  constructor() {
    super();
    this.options = {
      level: 'info',
      maxEntries: 1000,
      includeTimestamp: true,
    };
    this.entries = [];
  }

  mount(ctx: AsyncContext): this {
    ctx.on('dispose', () => this.dispose());
    return this;
  }

  log(message: string, data: Record<string, unknown> = {}): void {
    this.write('info', message, data);
  }

  warn(message: string, data: Record<string, unknown> = {}): void {
    this.write('warn', message, data);
  }

  error(message: string, data: Record<string, unknown> = {}): void {
    this.write('error', message, data);
  }

  debug(message: string, data: Record<string, unknown> = {}): void {
    this.write('debug', message, data);
  }

  getEntries(level?: LogLevel): LogEntry[] {
    const filtered = level 
      ? this.entries.filter(e => e.level === level)
      : this.entries;
    return [...filtered];
  }

  clear(): void {
    this.entries = [];
  }

  private write(
    level: LogLevel, 
    message: string, 
    data: Record<string, unknown>
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      module: 'ai-gateway',
      message,
      data,
    };

    this.entries.push(entry);
    
    if (this.entries.length > this.options.maxEntries) {
      this.entries.shift();
    }

    this.output(entry);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevel = levels.indexOf(this.options.level);
    const entryLevel = levels.indexOf(level);
    return entryLevel >= currentLevel;
  }

  private output(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.module}]`;
    const dataStr = Object.keys(entry.data).length > 0 
      ? ` ${JSON.stringify(entry.data)}`
      : '';
    
    // Output to console (could be replaced with proper logger)
    const output = `${prefix} ${entry.message}${dataStr}`;
    
    switch (entry.level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'debug':
        // Only output debug in development
        break;
      default:
        console.log(output);
    }
  }

  private dispose(): void {
    this.entries = [];
  }
}

export * from './types.js';
