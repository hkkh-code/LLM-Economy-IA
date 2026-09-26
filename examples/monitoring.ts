// monitoring.ts
// Shows how to track usage and get stats

import { 
  UsageTracker,
  AdminUIService
} from '@deepseek-ai/dsh-experimental-ai-gateway';

async function main() {
  const usageTracker = new UsageTracker();
  const adminUI = new AdminUIService();

  // Track some usage
  console.log('Tracking usage...\n');

  usageTracker.trackUsage({
    usage: { total_tokens: 150, prompt_tokens: 100, completion_tokens: 50 },
    success: true,
    provider: 'deepseek',
    model: 'deepseek-chat'
  });

  usageTracker.recordTokenSavings(45);  // saved 45 tokens
  usageTracker.recordCacheHit();

  usageTracker.trackUsage({
    usage: { total_tokens: 80, prompt_tokens: 50, completion_tokens: 30 },
    success: true,
    provider: 'deepseek',
    model: 'deepseek-chat'
  });

  usageTracker.recordTokenSavings(25);
  usageTracker.recordCacheMiss();

  // Get stats
  const stats = usageTracker.getStats();

  console.log('Daily stats:');
  console.log(`  Tokens used: ${stats.tokensUsedToday}`);
  console.log(`  Tokens saved: ${stats.tokensSavedToday}`);
  console.log(`  Savings: ${stats.savingPercentage}%`);
  console.log(`  Requests: ${stats.requestsToday}`);
  console.log(`  Success rate: ${(stats.successfulRequests / stats.requestsToday * 100).toFixed(1)}%`);
  console.log(`  Cache hit rate: ${(stats.cacheHits / (stats.cacheHits + stats.cacheMisses) * 100).toFixed(1)}%`);

  // Raise an alert
  adminUI.raiseAlert('warning', 'Approaching daily token budget');

  const dashboard = adminUI.getDashboardData();
  console.log('\nAlerts:');
  dashboard.alerts.forEach(alert => {
    console.log(`  [${alert.severity}] ${alert.message}`);
  });
}

main().catch(console.error);
