/**
 * @file Logging Manager type definitions
 * @module @deepseek-ai/dsh-experimental-ai-gateway-logging-manager
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  module: string;
  message: string;
  data: Record<string, unknown>;
}

export interface LoggingOptions {
  level: LogLevel;
  maxEntries: number;
  includeTimestamp: boolean;
}
