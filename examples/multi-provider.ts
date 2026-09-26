// multi-provider.ts
// Example showing how to use multiple AI providers with automatic fallback

import { 
  ProviderManager,
  FallbackManager,
  ApiKeyManager
} from '@deepseek-ai/dsh-experimental-ai-gateway';

async function main() {
  const providerManager = new ProviderManager();
  const fallbackManager = new FallbackManager();
  const keyManager = new ApiKeyManager(true, 10);

  // Add your providers here
  // DeepSeek as primary
  providerManager.registerProvider({
    id: 'deepseek',
    name: 'DeepSeek',
    status: 'active',
    keys: ['deepseek-key-1', 'deepseek-key-2'],
    limits: { rpm: 60, tpm: 100000 },
    models: ['deepseek-chat', 'deepseek-coder'],
    retryPolicy: { mode: 'normal', eligibleCodes: [] }
  });

  // OpenAI as backup
  providerManager.registerProvider({
    id: 'openai',
    name: 'OpenAI',
    status: 'active',
    keys: ['openai-key-1'],
    limits: { rpm: 60, tpm: 90000 },
    models: ['gpt-4', 'gpt-3.5-turbo'],
    retryPolicy: { mode: 'normal', eligibleCodes: [] }
  });

  // Anthropic as last resort
  providerManager.registerProvider({
    id: 'anthropic',
    name: 'Anthropic',
    status: 'active',
    keys: ['anthropic-key-1'],
    limits: { rpm: 60, tpm: 100000 },
    models: ['claude-3-opus', 'claude-3-sonnet'],
    retryPolicy: { mode: 'normal', eligibleCodes: [] }
  });

  // Set up the fallback order: try DeepSeek, then OpenAI, then Anthropic
  fallbackManager.registerChain('production', {
    name: 'production',
    providers: ['deepseek', 'openai', 'anthropic']
  });

  // Make a request with automatic fallback
  const result = await fallbackManager.executeWithFallback(
    async (providerId) => {
      console.log(`Trying ${providerId}...`);
      
      const provider = providerManager.getProvider(providerId);
      if (!provider) throw new Error(`No provider ${providerId}`);

      // In real code, make your API call here
      // For demo, just fail on first provider
      if (providerId === 'deepseek') {
        throw new Error('Simulated error');
      }

      return {
        provider: providerId,
        model: provider.models[0],
        response: 'Hello!'
      };
    },
    'production'
  );

  if (result.success) {
    console.log(`Success on ${result.usedProvider}`);
    console.log(`Model: ${result.result.model}`);
    console.log(`Response: ${result.result.response}`);
  } else {
    console.log(`All providers failed after ${result.attempts.length} tries`);
  }
}

main().catch(console.error);
