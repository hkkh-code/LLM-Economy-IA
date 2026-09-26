# Guide de Contribution

Merci de votre intérêt pour contribuer à Harness Economy!

## 🚀 Comment contribuer

### Reporter un bug

1. Vérifiez que le bug n'a pas déjà été rapporté dans les [Issues](https://github.com/votre-repo/Harness-Economy/issues)
2. Créez une nouvelle issue avec le template "Bug Report"
3. Incluez:
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs observé
   - Version de Node.js et OS
   - Logs d'erreur si disponibles

### Proposer une fonctionnalité

1. Ouvrez une issue avec le label "enhancement"
2. Décrivez la fonctionnalité souhaitée
3. Expliquez le cas d'usage
4 - Attendez la validation avant de coder

### Soumettre du code

1. Fork le repository
2. Créez une branche: `git checkout -b feature/ma-fonctionnalite`
3. Committez: `git commit -m 'Ajout de ma fonctionnalité'`
4. Push: `git push origin feature/ma-fonctionnalite`
5. Ouvrez une Pull Request

## 📝 Standards de code

- **TypeScript strict** - Pas de `any` sans justification
- **ESM** - Utilisez les imports ES modules
- **Tests** - Ajoutez des tests pour les nouvelles fonctionnalités
- **Documentation** - Documentez les fonctions publiques avec JSDoc
- **Lint** - Exécutez `pnpm run lint` avant de commit

## 🧪 Tests

```bash
# Tests unitaires
pnpm run test

# Couverture
pnpm run test:coverage

# Tests e2e
DEEPSEEK_API_KEY=xxx pnpm run test:e2e
```

## 📚 Structure des commits

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `test:` Ajout de tests
- `refactor:` Refactoring
- `chore:` Maintenance

## 🔍 Review process

1. Tous les PRs doivent passer les checks CI
2. Au moins une approbation requise
3. Squash and merge par défaut

---

Merci de contribuer! 🎉
