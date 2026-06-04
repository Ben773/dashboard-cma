# Dashboard Campagnes CMA — mode d'emploi

## Fichiers
- `index.html` — le dashboard (fichier unique, autonome, à partager).
- `serve.js` — petit serveur local pour le prévisualiser (`node serve.js` puis http://localhost:8777).
- `COMMENT_ACTUALISER.md` — ce fichier.

## Source des données
Tableau **Campagnes** de Monday.com (board `5091250450`), filtré sur les clients
**CMA** (id `2695108391`) et **CMA Formation** (id `2695105816`).

## Actualiser les données
Les données sont figées dans `index.html` entre les balises `/*DATA_START*/` et `/*DATA_END*/`.
Pour rafraîchir, demander à Claude (dans ce projet, avec le MCP Monday connecté) :

> « Actualise le dashboard CMA avec les dernières données de Monday »

Claude relit le board, recalcule et réécrit le bloc de données. Tout le reste (KPIs,
graphiques, table) se met à jour automatiquement à l'ouverture du fichier.

## Mise à jour automatique (≥ 24h)
Un rafraîchissement quotidien peut être planifié (routine programmée). Voir avec Claude
pour la mise en place et le mode de partage du fichier (lien hébergé ou Google Drive).
