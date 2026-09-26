# 🚀 Harness Economy - AI Gateway System

**Système complet de Token Economy + AutoSwitch API intelligent pour optimiser l'utilisation des modèles d'IA**

## 📋 Description

Harness Economy est un système modulaire qui optimise automatiquement l'utilisation des modèles d'IA en:
- **Économisant les tokens** via l'optimisation du contexte et des prompts
- **Évitant les erreurs** de quota, rate limit et dépassement de tokens
- **Maximisant la disponibilité** via la rotation automatique des clés API et le fallback entre providers

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI GATEWAY ORCHESTRATOR                   │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Token Manager │   │ Cache Manager │   │ Retry Manager │
│  - Budgets    │   │  - LRU/FIFO   │   │  - Backoff    │
│  - Tracking   │   │  - TTL        │   │  - Jitter     │
└───────────────┘   └───────────────┘   └───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ API Key Mgr   │   │ Rate Limit    │   │ Provider Mgr  │
│  - Rotation   │   │  - Cooldown   │   │  - Load Bal.  │
│  - Scoring    │   │  - Detection  │   │  - Health     │
└───────────────┘   └───────────────┘   └───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│Context Optim. │   │ Prompt Optim. │   │ Fallback Mgr  │
│  - Chunking   │   │  - Dedup      │   │  - Chains     │
│  - Priority   │   │  - Reduction  │   │  - Auto-Switch│
└───────────────┘   └───────────────┘   └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                    ┌───────────────┐
                    │ Usage Tracker │
                    │  + Admin UI   │
                    └───────────────┘
```

## 📦 Modules

| Module | Rôle | Fonctionnalités clés |
|--------|------|----------------------|
| **token-manager** | Gestion des budgets | Budgets input/output/context, profils d'économie, tracking temps réel |
| **context-optimizer** | Optimisation du contexte | Chunking intelligent, priorisation, compression configurable |
| **prompt-optimizer** | Optimisation des prompts | Déduplication, normalisation, réduction de tokens |
| **cache-manager** | Cache des réponses | LRU/FIFO/LFU, TTL configurable, statistiques de hits |
| **api-key-manager** | Rotation des clés | Scoring automatique, rotation intelligente, cooldown |
| **rate-limit-manager** | Gestion des limites | Détection 429, cooldown préventif, retry-after |
| **retry-manager** | Retry intelligent | Exponential backoff, jitter, codes retryables |
| **provider-manager** | Multi-provider | Load balancing, health checks, selection par modèle |
| **fallback-manager** | Failover automatique | Chaînes de fallback, basculement transparent |
| **usage-tracker** | Statistiques | Métriques temps réel, historique, économies réalisées |
| **logging-manager** | Logs structurés | Niveaux configurables, export, debugging |
| **admin-ui** | Interface admin | Dashboard, alertes, monitoring temps réel |

## ⚡ Installation

```bash
# Cloner le repository
git clone https://github.com/votre-repo/Harness-Economy.git
cd Harness-Economy

# Installer les dépendances (si utilisé dans DeepSeek Harness)
pnpm install

# Builder les modules
pnpm run build
```

## 🚀 Utilisation rapide

```typescript
import { AiGatewayService } from '@deepseek-ai/dsh-experimental-ai-gateway';

// Configuration
const gateway = new AiGatewayService({
  optimizationProfile: 'balanced',  // performance | balanced | tokenSaver | ultraSaver
  enableCache: true,
  cacheTTL: 300000,
  tokenBudget: {
    input: 100000,
    output: 30000,
    context: 50000,
    reserved: 5000,
    emergency: 10000,
  },
  retry: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitterRatio: 0.2,
  },
});

// Montage dans le contexte Cordis
gateway.mount(ctx);

// Les requêtes sont automatiquement optimisées
const response = await ctx.llm.stream({
  prompt: "Your prompt here",
  model: "deepseek-chat",
});
```

## 📊 Profils d'optimisation

| Profil | Utilisation | Économies | Réserve d'urgence |
|--------|------------|-----------|-------------------|
| `performance` | Priorité vitesse | ~10% | 5% |
| `balanced` | Équilibré | ~25% | 10% |
| `tokenSaver` | Économie tokens | ~40% | 15% |
| `ultraSaver` | Maximum d'économies | ~60% | 20% |

## 🔧 Configuration avancée

```yaml
# cordis.yml
- name: '@deepseek-ai/dsh-experimental-ai-gateway'
  config:
    optimizationProfile: balanced
    enableCache: true
    cacheTTL: 300000
    cacheStrategy: lru
    tokenBudget:
      input: 100000
      output: 30000
      context: 50000
      reserved: 5000
      emergency: 10000
    retry:
      maxRetries: 3
      initialDelayMs: 1000
      maxDelayMs: 30000
      backoffMultiplier: 2
      jitterRatio: 0.2
    cooldownDurationMs: 60000
    enableAutoSwitch: true
    maxKeysPerProvider: 5
```

## 📈 Monitoring

```typescript
// Statistiques d'utilisation
const stats = usageTracker.getStats();
console.log(`
  Tokens utilisés aujourd'hui: ${stats.tokensUsedToday}
  Tokens économisés: ${stats.tokensSavedToday}
  Économie: ${stats.savingPercentage}%
  Requêtes: ${stats.requestsToday}
  Taux de succès: ${(stats.successfulRequests / stats.requestsToday * 100).toFixed(2)}%
  Cache hit rate: ${(stats.cacheHits / (stats.cacheHits + stats.cacheMisses) * 100).toFixed(2)}%
`);

// Dashboard admin
const dashboard = adminUI.getDashboardData();
```

## 🧪 Tests

```bash
# Tests unitaires
pnpm run test

# Tests avec couverture
pnpm run test:coverage

# Tests e2e (nécessite DEEPSEEK_API_KEY)
pnpm run test:e2e
```

## 📁 Structure du projet

```
Harness-Economy/
├── README.md                          # Ce fichier
├── ai-gateway/                        # Code source des modules
│   ├── ai-gateway/                    # Orchestrateur principal
│   ├── token-manager/                 # Gestion tokens
│   ├── context-optimizer/             # Optimisation contexte
│   ├── prompt-optimizer/              # Optimisation prompts
│   ├── cache-manager/                 # Cache
│   ├── api-key-manager/               # Rotation clés API
│   ├── rate-limit-manager/            # Gestion rate limits
│   ├── retry-manager/                 # Retry
│   ├── provider-manager/              # Multi-provider
│   ├── fallback-manager/              # Fallback
│   ├── usage-tracker/                 # Statistiques
│   ├── logging-manager/               # Logs
│   └── admin-ui/                      # Interface admin
├── docs/                              # Documentation
│   ├── API.md                         # Référence API
│   ├── CONFIGURATION.md               # Guide de configuration
│   └── EXAMPLES.md                    # Exemples d'utilisation
└── examples/                          # Exemples de code
    ├── basic-usage.ts
    ├── advanced-config.ts
    └── custom-profile.ts
```

## 🤝 Contribution

Les contributions sont les bienvenues! Voir [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License

MIT License - voir [LICENSE](LICENSE)

## 🔗 Liens

- [DeepSeek Harness](https://github.com/deepseek-ai/harness)
- [Documentation Cordis](https://cordis.js.org)
- [DeepSeek API](https://platform.deepseek.com)

---

**Développé avec ❤️ pour la communauté DeepSeek Harness**
