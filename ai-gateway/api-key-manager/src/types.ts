/**
 * @file API Key Manager type definitions
 * @module @deepseek-ai/dsh-experimental-ai-gateway-api-key-manager
 */

export type KeyStatus = 'healthy' | 'rateLimited' | 'cooldown' | 'disabled';
export type KeyScoreEvent = 'success' | 'failure' | 'rateLimited';

export interface KeyMetadata {
  id: string;
  keyHash: string;
  status: KeyStatus;
  score: number;
  requests: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimits: number;
  lastUsed: Date;
  cooldownUntil: Date | null;
  priority: number;
}

export interface KeyManagerOptions {
  enableRotation: boolean;
  maxKeys: number;
  scoreThreshold: number;
  cooldownDuration: number;
}
