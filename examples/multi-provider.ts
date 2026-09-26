/**
 * @file Multi-provider example
 * Demonstrates fallback between multiple AI providers
 */

import { 
  ProviderManager,
  FallbackManager,
  ApiKeyManager
} from '@deepseek-ai/dsh-experimental-ai-gateway';

async function main() {
  const providerManager = new ProviderManager();
  const fallbackManager = new FallbackManager();
  const keyManager = new ApiKeyManager(true, 10);

  // Register DeepSeek as primary
  providerManager.registerProvider({
    id: 'deepseek',
    name: 'DeepSeek',
    status: 'active',
    keys: ['deepseek-key-1', 'deepseek-key-2'],
    limits: { rpm: 60, tpm: 100000 },
    models: ['deepseek-chat', 'deepseek-coder'],
    retryPolicy: { mode: 'normal', eligibleCodes: [] }
  });

  // Register OpenAI as secondary
  providerManager.registerProvider({
    id: 'openai',
    name: 'OpenAI',
    status: 'active',
    keys: ['openai-key-1'],
    limits: { rpm: 60, tpm: 90000 },
    models: ['gpt-4', 'gpt-3.5-turbo'],
    retryPolicy: { mode: 'normal', eligibleCodes: [] }
  });

  // Register Anthropic as fallback
  providerManager.registerProvider({
    id: 'anthropic',
    name: 'Anthropic',
    status: 'active',
    keys: ['anthropic-key-1'],
    limits: { rpm: 60, tpm: 100000 },
    models: ['claude-3-opus', 'claude-3-sonnet'],
    retryPolicy: { mode: 'normal', eligibleCodes: [] }
  });

  // Configure fallback chain: DeepSeek -> OpenAI -> Anthropic
  fallbackManager.registerChain('production', {
    name: 'production',
    providers: ['deepseek', 'openai', 'anthropic']
  });

  // Simulate a request with automatic fallback
  const result = await fallbackManager.executeWithFallback(
    async (providerId) => {
      console.log(`Trying provider: ${providerId}`);
      
      const provider = providerManager.getProvider(providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not found`);
      }

      // In real usage, make actual API call here
      if (providerId === 'deepseek') {
        // Simulate failure
        throw new Error('Simulated DeepSeek failure');
      }

      // Success on OpenAI
      return {
        provider: providerId,
        model: provider.models[0],
        response: 'Hello! How can I help you?'
      };
    },
    'production'
  );

  if (result.success) {
    console.log(`\n✓ Request successful on provider: ${result.usedProvider}`);
    console.log(`  Model: ${result.result.model}`);
    console.log(`  Response: ${result.result.response}`);
    console.log(`  Total fallbacks: ${result.totalFallbacks}`);
  } else {
    console.error(`\n✗ All providers failed after ${result.attempts.length} attempts`);
  }
}

main().catch(console.error);
