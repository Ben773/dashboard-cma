# Dashboard de suivi des campagnes CMA / CMA Formation

**🔗 En ligne :** https://ben773.github.io/dashboard-cma/

Suivi opérationnel & financier des campagnes **CMA** et **CMA Formation**, à partir du
tableau **Campagnes** de Monday.com (board `5091250450`), clients CMA (`2695108391`)
et CMA Formation (`2695105816`).

## Fonctionnement
- `index.html` — dashboard autonome (fichier unique). Les données sont figées entre
  les balises `/*DATA_START*/` et `/*DATA_END*/`.
- `refresh.js` — relit Monday via son API et réécrit le bloc de données.
- `.github/workflows/refresh.yml` — exécute `refresh.js` **chaque jour à 05:00 UTC**
  (~07:00 Paris l'été), puis committe et pousse si les données ont changé.
  GitHub Pages republie automatiquement → l'URL est toujours à jour, même PC éteint.

Le token API Monday est stocké dans le secret GitHub `MONDAY_TOKEN` (jamais dans le code).

## Actions manuelles
- **Forcer une mise à jour maintenant :** onglet *Actions* → *Rafraîchir le dashboard CMA*
  → *Run workflow*. (ou `gh workflow run refresh.yml`)
- **Tester en local :** `node serve.js` puis http://localhost:8777
- **Régénérer en local :** `MONDAY_TOKEN=xxx node refresh.js`

## Champs lus depuis Monday
| Donnée | Colonne |
|---|---|
| Client | `board_relation_mm08s008` (via `display_value`) |
| Statut | `color_mm08xtat` |
| Échéancier | `timerange_mm08k7s5` |
| Canaux | `dropdown_mm09snbc` |
| Média HT / statut | `numeric_mm08yzzt` / `color_mm089w50` |
| Honoraires HT / statut | `numeric_mm08a4wd` / `color_mm08s5fb` |
| Code campagne | `text_mm08e5s6` |
