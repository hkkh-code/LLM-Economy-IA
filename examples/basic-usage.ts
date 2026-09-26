// basic-usage.ts
// The simplest way to use it

import { AiGatewayService } from '@deepseek-ai/dsh-experimental-ai-gateway';

async function main() {
  // Just pass the profile you want
  const gateway = new AiGatewayService({
    optimizationProfile: 'balanced',
    enableCache: true
  });

  // mount it and you're done
  gateway.mount(ctx);

  // Now all requests through ctx.llm will be automatically optimized
  // - tokens are tracked
  // - prompts are compressed
  // - cache avoids duplicate calls
  // - retries happen automatically
  
  console.log('Gateway ready');
}

main().catch(console.error);
