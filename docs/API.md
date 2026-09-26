# API Reference

## Table des matières

- [AiGatewayService](#aigatewayservice)
- [TokenManager](#tokenmanager)
- [ContextOptimizer](#contextoptimizer)
- [PromptOptimizer](#promptoptimizer)
- [CacheManager](#cachemanager)
- [ApiKeyManager](#apikeymanager)
- [RateLimitManager](#ratelimitmanager)
- [RetryManager](#retrymanager)
- [ProviderManager](#providermanager)
- [FallbackManager](#fallbackmanager)
- [UsageTracker](#usagetracker)
- [LoggingManager](#loggingmanager)
- [AdminUIService](#adminuiservice)

---

## AiGatewayService

Service principal qui orchestre tous les modules.

### Configuration

```typescript
interface AiGatewayConfig {
  optimizationProfile?: 'performance' | 'balanced' | 'tokenSaver' | 'ultraSaver';
  enableCache?: boolean;
  cacheTTL?: number;
  cacheStrategy?: 'lru' | 'fifo' | 'lfu';
  tokenBudget?: {
    input?: number;
    output?: number;
    context?: number;
    reserved?: number;
    emergency?: number;
  };
  retry?: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffMultiplier?: number;
    jitterRatio?: number;
  };
  cooldownDurationMs?: number;
  enableAutoSwitch?: boolean;
  maxKeysPerProvider?: number;
}
```

### Méthodes

#### `constructor(config?: AiGatewayConfig)`

Crée une instance du service.

```typescript
const gateway = new AiGatewayService({
  optimizationProfile: 'balanced',
  enableCache: true,
});
```

#### `mount(ctx: AsyncContext): void`

Monte le service dans le contexte Cordis.

```typescript
gateway.mount(ctx);
```

---

## TokenManager

Gère les budgets de tokens et le tracking.

### Configuration

```typescript
interface TokenBudget {
  input: number;      // Budget tokens d'entrée
  output: number;     // Budget tokens de sortie
  context: number;    // Budget contexte
  reserved: number;   // Réserve de sécurité
  emergency: number;  // Pool d'urgence
}
```

### Méthodes

#### `checkBudget(request: { prompt?: string; context?: string }): BudgetCheck`

Vérifie si la requête respecte le budget.

```typescript
const check = tokenManager.checkBudget({
  prompt: "Long prompt here...",
  context: "Context data..."
});

if (!check.allowed) {
  console.error(check.reason);
}
```

#### `recordUsage(usage: Partial<TokenUsage>): void`

Enregistre l'utilisation de tokens.

```typescript
tokenManager.recordUsage({
  input: 100,
  output: 50,
  context: 200
});
```

#### `getUsage(): TokenUsage`

Retourne l'utilisation actuelle.

```typescript
const usage = tokenManager.getUsage();
console.log(`Total: ${usage.total} tokens`);
```

---

## ContextOptimizer

Optimise et compresse le contexte.

### Méthodes

#### `optimize<T>(request: T): Promise<ContextOptimizationResult>`

Optimise le contexte d'une requête.

```typescript
const result = await contextOptimizer.optimize(request);
console.log(`Saved ${result.savings}% tokens`);
```

---

## PromptOptimizer

Optimise et déduplique les prompts.

### Méthodes

#### `optimize<T>(request: T): Promise<PromptOptimizationResult>`

Optimise un prompt.

```typescript
const result = await promptOptimizer.optimize(prompt);
console.log(`Transformations: ${result.transformations.join(', ')}`);
```

---

## CacheManager

Cache les réponses avec TTL configurable.

### Méthodes

#### `get<T>(request: T): Promise<T | null>`

Récupère une réponse du cache.

```typescript
const cached = await cacheManager.get(request);
if (cached) {
  return cached;
}
```

#### `set<T>(request: T, response: T): Promise<void>`

Met en cache une réponse.

```typescript
await cacheManager.set(request, response);
```

#### `getStats(): CacheStats`

Retourne les statistiques du cache.

```typescript
const stats = cacheManager.getStats();
console.log(`Hit rate: ${stats.hits / (stats.hits + stats.misses)}`);
```

---

## ApiKeyManager

Gère la rotation des clés API.

### Méthodes

#### `registerKey(key: string, priority?: number): void`

Enregistre une nouvelle clé API.

```typescript
apiKeyManager.registerKey('sk-xxxx', 1); // Priorité 1
```

#### `selectKey(request?: unknown): string | null`

Sélectionne la meilleure clé disponible.

```typescript
const keyId = apiKeyManager.selectKey();
if (!keyId) {
  throw new Error('No available keys');
}
```

#### `updateKeyStatus(keyId: string, event: KeyScoreEvent): void`

Met à jour le statut d'une clé.

```typescript
// Succès
apiKeyManager.updateKeyStatus(keyId, 'success');

// Rate limit
apiKeyManager.updateKeyStatus(keyId, 'rateLimited');
```

---

## RateLimitManager

Gère les rate limits et cooldowns.

### Méthodes

#### `canProceed(keyId: string): boolean`

Vérifie si une clé peut être utilisée.

```typescript
if (rateLimitManager.canProceed(keyId)) {
  // OK to proceed
}
```

#### `recordRateLimit(keyId: string, retryAfter?: number): void`

Enregistre un rate limit.

```typescript
rateLimitManager.recordRateLimit(keyId, 60); // Retry-After: 60s
```

---

## RetryManager

Gère les retries avec exponential backoff.

### Méthodes

#### `execute<T>(operation: () => Promise<T>, isRetryable?: (error: Error) => boolean): Promise<RetryResult<T>>`

Exécute une opération avec retry automatique.

```typescript
const result = await retryManager.execute(
  () => makeApiRequest(),
  (error) => error.status === 429
);

if (!result.success) {
  console.error(`Failed after ${result.attempts} attempts`);
}
```

---

## ProviderManager

Gère plusieurs providers AI.

### Méthodes

#### `registerProvider(info: ProviderInfo): void`

Enregistre un provider.

```typescript
providerManager.registerProvider({
  id: 'deepseek',
  name: 'DeepSeek',
  status: 'active',
  keys: ['key1', 'key2'],
  limits: { rpm: 60, tpm: 100000 },
  models: ['deepseek-chat', 'deepseek-coder'],
  retryPolicy: { mode: 'normal', eligibleCodes: [] }
});
```

#### `selectProvider(model?: string): ProviderInfo | null`

Sélectionne un provider.

```typescript
const provider = providerManager.selectProvider('deepseek-chat');
```

---

## FallbackManager

Gère les chaînes de fallback.

### Méthodes

#### `executeWithFallback<T>(operation: (provider: string) => Promise<T>, chainName?: string): Promise<FallbackResult<T>>`

Exécute avec fallback automatique.

```typescript
const result = await fallbackManager.executeWithFallback(
  async (provider) => {
    return await makeRequest(provider);
  }
);

if (!result.success) {
  console.error(`All ${result.attempts.length} providers failed`);
}
```

---

## UsageTracker

Track l'utilisation et les économies.

### Méthodes

#### `trackUsage(response: unknown): void`

Enregistre l'utilisation d'une réponse.

```typescript
usageTracker.trackUsage(response);
```

#### `recordTokenSavings(saved: number): void`

Enregistre les tokens économisés.

```typescript
usageTracker.recordTokenSavings(150);
```

#### `getStats(): UsageStats`

Retourne les statistiques.

```typescript
const stats = usageTracker.getStats();
console.log(`Tokens saved today: ${stats.tokensSavedToday}`);
console.log(`Saving percentage: ${stats.savingPercentage}%`);
```

---

## LoggingManager

Logs structurés pour le debugging.

### Méthodes

#### `log(message: string, data?: Record<string, unknown>): void`

Log niveau info.

```typescript
loggingManager.log('Request received', { requestId: '123' });
```

#### `warn(message: string, data?: Record<string, unknown>): void`

Log niveau warning.

#### `error(message: string, data?: Record<string, unknown>): void`

Log niveau error.

#### `getEntries(level?: LogLevel): LogEntry[]`

Récupère les logs.

```typescript
const errors = loggingManager.getEntries('error');
```

---

## AdminUIService

Interface d'administration.

### Méthodes

#### `getSystemStats(): SystemStats`

Retourne les statistiques système.

```typescript
const stats = adminUI.getSystemStats();
```

#### `getDashboardData(): DashboardData`

Retourne les données du dashboard.

```typescript
const dashboard = adminUI.getDashboardData();
```

#### `raiseAlert(severity: Alert['severity'], message: string): void`

Lève une alerte.

```typescript
adminUI.raiseAlert('warning', 'Rate limit approaching');
```
