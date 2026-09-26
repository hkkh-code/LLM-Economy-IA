# Exemples d'utilisation

## Exemple 1: Utilisation basique

```typescript
import { AiGatewayService } from '@deepseek-ai/dsh-experimental-ai-gateway';

// Créer le gateway avec configuration par défaut
const gateway = new AiGatewayService({
  optimizationProfile: 'balanced',
  enableCache: true
});

// Monter dans le contexte
gateway.mount(ctx);

// Utiliser normalement - le gateway optimise automatiquement
const response = await ctx.llm.stream({
  model: 'deepseek-chat',
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

## Exemple 2: Configuration avancée

```typescript
import { AiGatewayService } from '@deepseek-ai/dsh-experimental-ai-gateway';

const gateway = new AiGatewayService({
  optimizationProfile: 'tokenSaver',
  
  // Cache configuration
  enableCache: true,
  cacheTTL: 600000, // 10 minutes
  cacheStrategy: 'lfu',
  
  // Token budgets
  tokenBudget: {
    input: 200000,
    output: 50000,
    context: 100000,
    reserved: 10000,
    emergency: 20000
  },
  
  // Retry configuration
  retry: {
    maxRetries: 5,
    initialDelayMs: 2000,
    maxDelayMs: 60000,
    backoffMultiplier: 2.5,
    jitterRatio: 0.3
  },
  
  // Rate limit
  cooldownDurationMs: 120000, // 2 minutes
  
  // Auto-switch
  enableAutoSwitch: true,
  maxKeysPerProvider: 10
});

gateway.mount(ctx);
```

## Exemple 3: Gestion manuelle des clés API

```typescript
import { ApiKeyManager } from '@deepseek-ai/dsh-experimental-ai-gateway-api-key-manager';

const keyManager = new ApiKeyManager(true, 5);

// Enregistrer plusieurs clés avec priorités
keyManager.registerKey(process.env.DEEPSEEK_API_KEY_PRIMARY, 1);
keyManager.registerKey(process.env.DEEPSEEK_API_KEY_SECONDARY, 2);
keyManager.registerKey(process.env.DEEPSEEK_API_KEY_BACKUP, 3);

// Sélectionner une clé
const keyId = keyManager.selectKey();

// Mettre à jour le statut après utilisation
try {
  await makeRequest(keyId);
  keyManager.updateKeyStatus(keyId, 'success');
} catch (error) {
  if (error.status === 429) {
    keyManager.updateKeyStatus(keyId, 'rateLimited');
  } else {
    keyManager.updateKeyStatus(keyId, 'failure');
  }
}

// Vérifier les stats
const stats = keyManager.getKeyStats(keyId);
console.log(`Key score: ${stats.score}`);
console.log(`Success rate: ${stats.successfulRequests / stats.requests}`);
```

## Exemple 4: Fallback entre providers

```typescript
import { FallbackManager } from '@deepseek-ai/dsh-experimental-ai-gateway-fallback-manager';
import { ProviderManager } from '@deepseek-ai/dsh-experimental-ai-gateway-provider-manager';

const providerManager = new ProviderManager();
const fallbackManager = new FallbackManager();

// Enregistrer les providers
providerManager.registerProvider({
  id: 'deepseek',
  name: 'DeepSeek',
  status: 'active',
  keys: ['key1', 'key2'],
  limits: { rpm: 60, tpm: 100000 },
  models: ['deepseek-chat'],
  retryPolicy: { mode: 'normal', eligibleCodes: [] }
});

providerManager.registerProvider({
  id: 'openai',
  name: 'OpenAI',
  status: 'active',
  keys: ['key3'],
  limits: { rpm: 60, tpm: 90000 },
  models: ['gpt-4'],
  retryPolicy: { mode: 'normal', eligibleCodes: [] }
});

// Configurer la chaîne de fallback
fallbackManager.registerChain('main', {
  name: 'main',
  providers: ['deepseek', 'openai', 'anthropic']
});

// Utiliser avec fallback automatique
const result = await fallbackManager.executeWithFallback(async (providerId) => {
  const provider = providerManager.getProvider(providerId);
  const key = keyManager.selectKey();
  
  return await makeApiCall(provider, key);
}, 'main');

if (!result.success) {
  console.error('All providers failed:', result.attempts);
}
```

## Exemple 5: Monitoring et statistiques

```typescript
import { UsageTracker } from '@deepseek-ai/dsh-experimental-ai-gateway-usage-tracker';
import { AdminUIService } from '@deepseek-ai/dsh-experimental-ai-gateway-admin-ui';

const usageTracker = new UsageTracker();
const adminUI = new AdminUIService();

// Tracker l'utilisation
usageTracker.trackUsage(response);
usageTracker.recordTokenSavings(150);

// Récupérer les stats
const stats = usageTracker.getStats();
console.log(`
📊 Statistiques du jour:
  Tokens utilisés: ${stats.tokensUsedToday}
  Tokens économisés: ${stats.tokensSavedToday}
  Économie: ${stats.savingPercentage}%
  Requêtes: ${stats.requestsToday}
  Succès: ${stats.successfulRequests}/${stats.requestsToday}
  Cache hit rate: ${(stats.cacheHits / (stats.cacheHits + stats.cacheMisses) * 100).toFixed(1)}%
`);

// Dashboard admin
const dashboard = adminUI.getDashboardData();
dashboard.alerts.forEach(alert => {
  console.log(`[${alert.severity}] ${alert.message}`);
});
```

## Exemple 6: Retry avec exponential backoff

```typescript
import { RetryManager } from '@deepseek-ai/dsh-experimental-ai-gateway-retry-manager';

const retryManager = new RetryManager({
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterRatio: 0.2
});

// Exécuter avec retry
const result = await retryManager.execute(
  async () => {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
  // Fonction pour déterminer si l'erreur est retryable
  (error) => {
    const retryableStatuses = [429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }
);

if (!result.success) {
  console.error(`Failed after ${result.attempts} attempts in ${result.totalDelayMs}ms`);
  throw result.error;
}

console.log(`Success after ${result.attempts} attempts`);
```

## Exemple 7: Optimisation de contexte

```typescript
import { ContextOptimizer } from '@deepseek-ai/dsh-experimental-ai-gateway-context-optimizer';

const optimizer = new ContextOptimizer({
  maxContextSize: 4000,
  compressionRatio: 0.7,
  preserveSystem: true,
  preserveInstructions: true,
  chunkStrategy: 'relevance'
});

const result = await optimizer.optimize({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Long message...' },
    // ... many more messages
  ]
});

console.log(`Original: ${result.originalTokens} tokens`);
console.log(`Optimized: ${result.optimizedTokens} tokens`);
console.log(`Savings: ${result.savings}%`);

// Utiliser le contexte optimisé
const response = await ctx.llm.stream({
  model: 'deepseek-chat',
  messages: [{ role: 'user', content: result.optimized }]
});
```

## Exemple 8: Integration complète

```typescript
import { 
  AiGatewayService,
  TokenManager,
  CacheManager,
  ApiKeyManager,
  RateLimitManager,
  RetryManager,
  UsageTracker
} from '@deepseek-ai/dsh-experimental-ai-gateway';

// Configuration complète
const gateway = new AiGatewayService({
  optimizationProfile: 'balanced',
  enableCache: true,
  tokenBudget: {
    input: 100000,
    output: 30000,
    context: 50000,
    reserved: 5000,
    emergency: 10000
  }
});

// Monter le gateway
gateway.mount(ctx);

// Enregistrer les clés API
ctx.aiGatewayApiKeyManager.registerKey(process.env.DEEPSEEK_API_KEY_1, 1);
ctx.aiGatewayApiKeyManager.registerKey(process.env.DEEPSEEK_API_KEY_2, 2);

// Utiliser le système
async function makeOptimizedRequest(prompt: string) {
  // Le gateway gère tout automatiquement:
  // 1. Vérification du budget
  // 2. Optimisation du prompt
  // 3. Sélection de la meilleure clé
  // 4. Cache lookup
  // 5. Retry si nécessaire
  // 6. Fallback si échec
  
  return await ctx.llm.stream({
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: prompt }]
  });
}

// Monitorer
setInterval(() => {
  const stats = ctx.aiGatewayUsageTracker.getStats();
  console.log(`Token savings: ${stats.savingPercentage}%`);
}, 60000);
```
