/**
 * @file Admin UI - Administrative interface for AI Gateway
 * @module @deepseek-ai/dsh-experimental-ai-gateway-admin-ui
 */

import { AsyncContext, Service } from '@deepseek-ai/cordis';
import type { AdminUIOptions, SystemStats, DashboardData, ActivityEvent, Alert } from './types.js';

export class AdminUIService extends Service {
  readonly name = 'aiGatewayAdminUI';

  private options: AdminUIOptions;
  private activities: ActivityEvent[];
  private alerts: Alert[];

  constructor(options: Partial<AdminUIOptions> = {}) {
    super();
    this.options = {
      enableDashboard: options.enableDashboard ?? true,
      refreshInterval: options.refreshInterval ?? 5000,
      port: options.port ?? 3001,
    };
    this.activities = [];
    this.alerts = [];
  }

  mount(ctx: AsyncContext): this {
    ctx.on('dispose', () => this.dispose());
    return this;
  }

  getSystemStats(): SystemStats {
    return {
      activeKeys: 0,
      keysInCooldown: 0,
      tokensUsed: 0,
      tokensSaved: 0,
      requestsToday: 0,
      successRate: 0,
      cacheHitRate: 0,
      topProviders: [],
    };
  }

  getDashboardData(): DashboardData {
    return {
      stats: this.getSystemStats(),
      recentActivity: this.activities.slice(-50),
      alerts: this.alerts.filter(a => !a.acknowledged),
    };
  }

  recordActivity(event: ActivityEvent): void {
    this.activities.push(event);
    if (this.activities.length > 1000) {
      this.activities.shift();
    }
  }

  raiseAlert(severity: Alert['severity'], message: string): void {
    this.alerts.push({
      id: `alert-${Date.now()}`,
      severity,
      message,
      timestamp: new Date(),
      acknowledged: false,
    });
  }

  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  getActivities(limit: number = 50): ActivityEvent[] {
    return this.activities.slice(-limit);
  }

  getAlerts(includeAcknowledged: boolean = false): Alert[] {
    return includeAcknowledged 
      ? [...this.alerts]
      : this.alerts.filter(a => !a.acknowledged);
  }

  clearActivities(): void {
    this.activities = [];
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  private dispose(): void {
    this.activities = [];
    this.alerts = [];
  }
}

export * from './types.js';
