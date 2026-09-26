# Guide de Configuration

## Configuration de base

### Profils d'optimisation

| Profil | Description | Cas d'usage |
|--------|-------------|-------------|
| `performance` | Vitesse maximale | Applications temps réel, interactions utilisateur |
| `balanced` | Équilibre vitesse/économie | Usage général |
| `tokenSaver` | Maximum d'économies | Traitements par lots, longues conversations |
| `ultraSaver` | Économies extrêmes | Budget très limité, tâches non critiques |

### Configuration minimale

```yaml
- name: '@deepseek-ai/dsh-experimental-ai-gateway'
  config:
    optimizationProfile: balanced
```

### Configuration complète

```yaml
- name: '@deepseek-ai/dsh-experimental-ai-gateway'
  config:
    # Profil d'optimisation
    optimizationProfile: balanced
    
    # Cache
    enableCache: true
    cacheTTL: 300000          # 5 minutes
    cacheStrategy: lru        # lru | fifo | lfu
    
    # Budget de tokens
    tokenBudget:
      input: 100000           # Max input tokens
      output: 30000           # Max output tokens
      context: 50000          # Max context tokens
      reserved: 5000          # Réserve de sécurité
      emergency: 10000        # Pool d'urgence
    
    # Retry
    retry:
      maxRetries: 3
      initialDelayMs: 1000
      maxDelayMs: 30000
      backoffMultiplier: 2
      jitterRatio: 0.2
    
    # Rate limit
    cooldownDurationMs: 60000
    
    # Auto-switch
    enableAutoSwitch: true
    maxKeysPerProvider: 5
```

## Configuration par module

### Token Manager

```typescript
const tokenManager = new TokenManager(
  {
    input: 100000,
    output: 30000,
    context: 50000,
    reserved: 5000,
    emergency: 10000
  },
  'balanced' // profile
);
```

### Cache Manager

```typescript
const cacheManager = new CacheManager(
  300000,  // TTL: 5 minutes
  'lru'    // Strategy: lru | fifo | lfu
);
```

### API Key Manager

```typescript
const apiKeyManager = new ApiKeyManager(
  true,  // enableRotation
  5      // maxKeys
);

// Enregistrer les clés
apiKeyManager.registerKey('sk-primary-key', 1);    // Priorité haute
apiKeyManager.registerKey('sk-secondary-key', 2);  // Priorité basse
apiKeyManager.registerKey('sk-backup-key', 3);     // Backup
```

### Rate Limit Manager

```typescript
const rateLimitManager = new RateLimitManager(
  60000  // cooldownDurationMs
);
```

### Retry Manager

```typescript
const retryManager = new RetryManager({
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterRatio: 0.2
});
```

### Provider Manager

```typescript
const providerManager = new ProviderManager();

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

### Fallback Manager

```typescript
const fallbackManager = new FallbackManager();

// Enregistrer une chaîne de fallback
fallbackManager.registerChain('production', {
  name: 'production',
  providers: ['primary', 'secondary', 'fallback', 'emergency']
});
```

## Variables d'environnement

```bash
# API Keys
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_API_KEY_SECONDARY=sk-yyy

# Configuration
AI_GATEWAY_PROFILE=balanced
AI_GATEWAY_CACHE_TTL=300000
AI_GATEWAY_MAX_RETRIES=3
```

## Bonnes pratiques

### 1. Tokens Budget

- Gardez toujours une réserve (`reserved` + `emergency`)
- Ajustez selon vos besoins réels
- Monitorer l'utilisation avec `UsageTracker`

### 2. Cache

- Utilisez `lru` pour les workloads variés
- Utilisez `lfu` pour les workloads prévisibles
- Ajustez le TTL selon la fraîcheur des données

### 3. API Keys

- Ayez au moins 2-3 clés par provider
- Utilisez les priorités pour la rotation
- Monitorer les scores avec `getKeyStats()`

### 4. Rate Limits

- Configurez un cooldown supérieur au retry-after
- Utilisez le rate limit manager avec le key manager
- Activez les logs pour le debugging

### 5. Retry

- Limitez `maxRetries` à 3-5
- Utilisez le jitter pour éviter le thundering herd
- Personnalisez `isRetryable` selon vos besoins
