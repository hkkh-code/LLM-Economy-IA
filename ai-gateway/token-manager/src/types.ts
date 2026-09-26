/**
 * @file Token Manager type definitions
 * @module @deepseek-ai/dsh-experimental-ai-gateway-token-manager
 */

export type OptimizationProfile = 'performance' | 'balanced' | 'tokenSaver' | 'ultraSaver';

export interface TokenBudget {
  input: number;
  output: number;
  context: number;
  reserved: number;
  emergency: number;
}

export interface TokenUsage {
  input: number;
  output: number;
  context: number;
  total: number;
}

export interface BudgetCheck {
  allowed: boolean;
  reason?: string;
  remaining: number;
  used: number;
  budget: number;
}

export interface ProfileConfig {
  profile: OptimizationProfile;
  thresholds: {
    warning: number;  // Percentage before warning
    critical: number; // Percentage before critical
  };
  autoCompact: boolean;
  emergencyReserve: number;
}

export const DEFAULT_PROFILE_CONFIGS: Record<OptimizationProfile, ProfileConfig> = {
  performance: {
    profile: 'performance',
    thresholds: { warning: 80, critical: 95 },
    autoCompact: false,
    emergencyReserve: 5,
  },
  balanced: {
    profile: 'balanced',
    thresholds: { warning: 70, critical: 90 },
    autoCompact: true,
    emergencyReserve: 10,
  },
  tokenSaver: {
    profile: 'tokenSaver',
    thresholds: { warning: 60, critical: 85 },
    autoCompact: true,
    emergencyReserve: 15,
  },
  ultraSaver: {
    profile: 'ultraSaver',
    thresholds: { warning: 50, critical: 80 },
    autoCompact: true,
    emergencyReserve: 20,
  },
};
