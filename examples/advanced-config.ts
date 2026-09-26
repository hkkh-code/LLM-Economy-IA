// advanced-config.ts
// Shows all the configuration options available

import { AiGatewayService } from '@deepseek-ai/dsh-experimental-ai-gateway';

async function main() {
  // This is pretty much every option
  const gateway = new AiGatewayService({
    optimizationProfile: 'tokenSaver',  // pick your profile
    
    // caching
    enableCache: true,
    cacheTTL: 600000,
    cacheStrategy: 'lfu',
    
    // token budgets - adjust based on your typical usage
    tokenBudget: {
      input: 200000,
      output: 50000,
      context: 100000,
      reserved: 10000,   // safety buffer
      emergency: 20000   // only used if everything else fails
    },
    
    // retry stuff
    retry: {
      maxRetries: 5,
      initialDelayMs: 2000,
      maxDelayMs: 60000,
      backoffMultiplier: 2.5,
      jitterRatio: 0.3
    },
    
    cooldownDurationMs: 120000,  // wait 2min after rate limit
    
    enableAutoSwitch: true,
    maxKeysPerProvider: 10
  });

  console.log('Config loaded. Profile: tokenSaver');
}

main().catch(console.error);
