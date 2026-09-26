/**
 * @file Monitoring example
 * Shows how to track usage and get statistics
 */

import { 
  UsageTracker,
  AdminUIService
} from '@deepseek-ai/dsh-experimental-ai-gateway';

async function main() {
  const usageTracker = new UsageTracker();
  const adminUI = new AdminUIService();

  // Simulate some usage
  console.log('Tracking usage...\n');

  // Track a successful request
  usageTracker.trackUsage({
    usage: { total_tokens: 150, prompt_tokens: 100, completion_tokens: 50 },
    success: true,
    provider: 'deepseek',
    model: 'deepseek-chat'
  });

  // Record token savings from optimization
  usageTracker.recordTokenSavings(45); // Saved 45 tokens

  // Track cache hit
  usageTracker.recordCacheHit();

  // Track another request
  usageTracker.trackUsage({
    usage: { total_tokens: 80, prompt_tokens: 50, completion_tokens: 30 },
    success: true,
    provider: 'deepseek',
    model: 'deepseek-chat'
  });

  // Record more savings
  usageTracker.recordTokenSavings(25);

  // Track cache miss
  usageTracker.recordCacheMiss();

  // Get statistics
  const stats = usageTracker.getStats();

  console.log('📊 Daily Statistics:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Tokens used today:    ${stats.tokensUsedToday.toLocaleString()}`);
  console.log(`  Tokens saved today:   ${stats.tokensSavedToday.toLocaleString()}`);
  console.log(`  Saving percentage:    ${stats.savingPercentage.toFixed(1)}%`);
  console.log(`  Requests today:       ${stats.requestsToday}`);
  console.log(`  Successful requests:  ${stats.successfulRequests}`);
  console.log(`  Failed requests:      ${stats.failedRequests}`);
  console.log(`  Avg tokens/request:   ${stats.averageTokensPerRequest.toFixed(1)}`);
  console.log(`  Cache hits:           ${stats.cacheHits}`);
  console.log(`  Cache misses:         ${stats.cacheMisses}`);
  console.log(`  Cache hit rate:       ${((stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) * 100).toFixed(1)}%`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Raise an alert
  adminUI.raiseAlert('warning', 'Approaching daily token budget limit');

  // Get dashboard data
  const dashboard = adminUI.getDashboardData();

  console.log('🔔 Alerts:');
  dashboard.alerts.forEach(alert => {
    console.log(`  [${alert.severity.toUpperCase()}] ${alert.message}`);
    console.log(`    Time: ${alert.timestamp.toLocaleTimeString()}`);
    console.log(`    Acknowledged: ${alert.acknowledged}`);
  });

  // Acknowledge the alert
  adminUI.acknowledgeAlert(dashboard.alerts[0].id);
  console.log('\n✓ Alert acknowledged');

  // Show updated alerts (should be empty now)
  const remainingAlerts = adminUI.getAlerts(false);
  console.log(`\nRemaining alerts: ${remainingAlerts.length}`);
}

main().catch(console.error);
