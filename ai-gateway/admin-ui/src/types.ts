/**
 * @file Admin UI type definitions
 * @module @deepseek-ai/dsh-experimental-ai-gateway-admin-ui
 */

export interface AdminUIOptions {
  enableDashboard: boolean;
  refreshInterval: number;
  port: number;
}

export interface SystemStats {
  activeKeys: number;
  keysInCooldown: number;
  tokensUsed: number;
  tokensSaved: number;
  requestsToday: number;
  successRate: number;
  cacheHitRate: number;
  topProviders: ProviderStats[];
}

export interface ProviderStats {
  id: string;
  name: string;
  requests: number;
  successRate: number;
  avgLatency: number;
}

export interface DashboardData {
  stats: SystemStats;
  recentActivity: ActivityEvent[];
  alerts: Alert[];
}

export interface ActivityEvent {
  timestamp: Date;
  type: 'request' | 'fallback' | 'rate_limit' | 'error';
  provider?: string;
  tokens?: number;
  message: string;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}
