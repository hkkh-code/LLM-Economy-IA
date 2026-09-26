/**
 * @file Provider Manager type definitions
 * @module @deepseek-ai/dsh-experimental-ai-gateway-provider-manager
 */

export type ProviderStatus = 'active' | 'disabled';
export type LoadBalanceStrategy = 'round-robin' | 'least-connections' | 'random';

export interface ProviderInfo {
  id: string;
  name: string;
  status: ProviderStatus;
  keys: string[];
  limits: {
    rpm: number;
    tpm: number;
  };
  models: string[];
  retryPolicy: {
    mode: 'normal' | 'always';
    eligibleCodes: string[];
  };
}

export interface ProviderOptions {
  loadBalanceStrategy: LoadBalanceStrategy;
  healthCheckInterval: number;
}
