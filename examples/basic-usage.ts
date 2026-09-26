/**
 * @file Basic usage example
 * Demonstrates the simplest way to use AI Gateway
 */

import { AiGatewayService } from '@deepseek-ai/dsh-experimental-ai-gateway';

async function main() {
  // Create gateway with default balanced profile
  const gateway = new AiGatewayService({
    optimizationProfile: 'balanced',
    enableCache: true
  });

  // The gateway automatically:
  // - Optimizes prompts and context
  // - Manages token budgets
  // - Caches responses
  // - Handles retries
  // - Rotates API keys if multiple are configured
  
  console.log('AI Gateway initialized with balanced profile');
  console.log('Features enabled: cache, token tracking, optimization');
}

main().catch(console.error);
