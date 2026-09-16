# Polices

Deux familles, auto-hébergées au format WOFF2 (sous-ensembles `latin` + `latin-ext`,
fichiers variables couvrant les graisses 400 → 800).

| Famille          | Fichiers                                             | Licence         |
|------------------|------------------------------------------------------|-----------------|
| **Syne**         | `syne-latin.woff2`, `syne-latin-ext.woff2`           | SIL Open Font License 1.1 |
| **JetBrains Mono** | `jetbrainsmono-latin.woff2`, `jetbrainsmono-latin-ext.woff2` | SIL Open Font License 1.1 |

- Syne — Bonjour Monde : <https://gitlab.com/bonjourmonde/syne>
- JetBrains Mono — JetBrains : <https://github.com/JetBrains/JetBrainsMono>

La SIL OFL autorise l'auto-hébergement et l'intégration sur un site web sans redevance.
Aucune requête vers Google Fonts n'est faite : les `@font-face` pointent vers `/fonts/*.woff2`
(voir `src/styles/global.css`).
