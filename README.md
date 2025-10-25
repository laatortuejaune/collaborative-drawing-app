# Collaborative Drawing App

Une application de dessin collaboratif en temps réel construite avec React, TypeScript et Vite.

## 🚀 Déploiement Automatique

Ce projet utilise GitHub Actions pour builder et déployer automatiquement le frontend sur GitHub Pages à chaque push sur la branche `main`.

### Configuration du Déploiement

Le workflow de déploiement est configuré dans `.github/workflows/deploy.yml` et effectue les actions suivantes :

1. **Build** :
   - Checkout du code
   - Installation de Node.js 20
   - Installation des dépendances avec `npm ci`
   - Build du projet Vite avec `npm run build`
   - Upload de l'artifact `dist/` pour GitHub Pages

2. **Deploy** :
   - Déploiement automatique du dossier `dist/` sur GitHub Pages
   - Accessible via l'URL GitHub Pages du repository

### Comment Activer le Déploiement

1. **Vérifier que GitHub Pages est activé** :
   - Aller dans `Settings` > `Pages`
   - S'assurer que la source est configurée sur `GitHub Actions`

2. **Déclencher un déploiement** :
   - Chaque push sur la branche `main` déclenche automatiquement le workflow
   - Le workflow peut aussi être déclenché manuellement depuis l'onglet `Actions`

3. **Vérifier le déploiement** :
   - Aller dans l'onglet `Actions` pour voir le statut du workflow
   - Une fois terminé, l'application est accessible via l'URL GitHub Pages

## 📦 Structure du Projet

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml      # Workflow de déploiement automatique
├── frontend/               # Application frontend React + Vite
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── backend/                # Backend (si applicable)
```

## 🛠️ Développement Local

### Prérequis
- Node.js 20 ou supérieur
- npm

### Installation et Lancement

```bash
# Installer les dépendances
cd frontend
npm install

# Lancer le serveur de développement
npm run dev

# Builder pour la production
npm run build

# Prévisualiser le build de production
npm run preview
```

## 🔧 Configuration Vite

Le fichier `vite.config.ts` est configuré pour le déploiement sur GitHub Pages. Si votre repository a un nom différent, assurez-vous d'ajuster la propriété `base` dans la configuration Vite :

```typescript
export default defineConfig({
  base: '/collaborative-drawing-app/',
  // ...
})
```

## 🌐 URL de Déploiement

Une fois déployée, l'application sera accessible à :
```
https://laatortuejaune.github.io/collaborative-drawing-app/
```

## 📝 Notes

- Le déploiement prend généralement 1-2 minutes après un push
- En cas d'échec, vérifier les logs dans l'onglet Actions
- S'assurer que le fichier `package-lock.json` existe dans le dossier frontend
