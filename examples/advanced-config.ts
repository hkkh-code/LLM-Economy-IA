/**
 * @file Advanced configuration example
 * Shows all configuration options
 */

import { AiGatewayService } from '@deepseek-ai/dsh-experimental-ai-gateway';

async function main() {
  const gateway = new AiGatewayService({
    // Optimization profile
    optimizationProfile: 'tokenSaver',
    
    // Cache settings
    enableCache: true,
    cacheTTL: 600000,        // 10 minutes
    cacheStrategy: 'lfu',    // Least Frequently Used
    
    // Token budgets
    tokenBudget: {
      input: 200000,         // 200K input tokens
      output: 50000,         // 50K output tokens
      context: 100000,       // 100K context tokens
      reserved: 10000,       // 10K reserved buffer
      emergency: 20000       // 20K emergency pool
    },
    
    // Retry configuration
    retry: {
      maxRetries: 5,
      initialDelayMs: 2000,
      maxDelayMs: 60000,
      backoffMultiplier: 2.5,
      jitterRatio: 0.3       // 30% jitter
    },
    
    // Rate limit handling
    cooldownDurationMs: 120000,  // 2 minutes
    
    // Auto-switch features
    enableAutoSwitch: true,
    maxKeysPerProvider: 10
  });

  console.log('Advanced configuration loaded');
  console.log('Profile: tokenSaver (maximum token savings)');
  console.log('Cache: LFU strategy, 10 min TTL');
  console.log('Budget: 200K input, 50K output, 100K context');
  console.log('Retry: 5 max, 2-60s delays, 2.5x backoff');
}

main().catch(console.error);
