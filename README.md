# SQL QUEST

Un jeu pour apprendre le SQL dans l’esprit de [Flexbox Froggy](https://flexboxfroggy.com/#fr) : on choisit une base de données, on lit la question et on écrit la requête qui produit le résultat attendu. Le jeu tourne sur **MySQL** (par défaut) et sur **PostgreSQL**, avec de vrais serveurs.

- **Quatre bases**, chacune avec ses propres niveaux progressifs :

  | Base | Niveaux | Données | Notions |
  |---|---|---|---|
  | ⚽ Coupe du monde | 16 | réelles, 1930 – 2022 | de `SELECT *` à `LEFT JOIN` |
  | 🪐 Système solaire | 17 | réelles (NASA) | `DISTINCT`, `MIN`/`MAX`/`AVG`, `BETWEEN`, `LIKE`, table de liaison, `EXTRACT`, `CASE` |
  | 🥐 Boulangerie | 16 | fictives | `IN`, `CONCAT`, `COALESCE`, calculs, auto-jointure, `NOT EXISTS`, `WITH` + `RANK()` |
  | 📚 Médiathèque | 16 | auteurs et livres réels, emprunts fictifs | `COUNT(DISTINCT)`, `UNION`, sous-requête corrélée, `EXISTS`, `CASE` dans `GROUP BY`, `RANK() OVER` |

- **Mode jeu** : la requête du joueur est comparée à une solution cachée : mêmes lignes et mêmes valeurs, alias de colonnes libres, ordre vérifié seulement quand la question demande un tri. En cas de réussite, des confettis ; en cas d’échec, l’éditeur tremble et le jeu explique la raison.
- **Bac à sable** : requêtes libres, exemples en un clic, historique.
- Thème sombre ou clair, interface desktop et mobile (la maquette se trouve dans `design/maquette.figcraft`).

## Lancer le projet

Prérequis : Docker et Node.js 20 ou plus.

```bash
cp .env.example .env        # identifiants et ports (MySQL 3307, PostgreSQL 5433)
docker compose up -d        # démarre MySQL 8.4 et PostgreSQL 16
npm install
npm run seed                # crée les bases et l'utilisateur en lecture seule
npm start                   # http://localhost:3000
```

`npm run check` exécute la solution de chaque niveau sur les deux moteurs, vérifie que MySQL et PostgreSQL donnent le même résultat et que l’écriture est bien refusée.

## Organisation

```
data/
  bases.js                 registre des bases
  coupe_du_monde/          une base = un dossier (idem systeme_solaire, boulangerie, mediatheque)
    schema.js              tables (définition neutre, traduite pour MySQL et PostgreSQL)
    donnees.js             lignes à insérer
    niveaux.js             questions, indices et solutions
    index.js               nom, icône, description, exemples du bac à sable
server/
  index.js                 API Express + fichiers statiques
  engines.js               exécution MySQL / PostgreSQL (utilisateur en lecture seule)
  validate.js              comparaison résultat obtenu / attendu
  seed.js, check.js
public/                    interface (HTML, CSS, JS sans framework)
```

### Ajouter une base

1. Copier `data/coupe_du_monde/` vers `data/<id>/`, puis adapter `schema.js`, `donnees.js`, `niveaux.js` et `index.js`.
2. L’importer dans `data/bases.js`.
3. Lancer `npm run seed`, puis `npm run check`.

Écrivez les solutions en SQL standard (sans backticks ni `LIMIT x, y`) pour qu’elles fonctionnent sur les deux moteurs : `CONCAT()` plutôt que `||`, `EXTRACT(YEAR FROM …)` pour les dates, pas de division entre entiers, et un `LIMIT` sans ex aequo à la limite. Les dates sont renvoyées au format `AAAA-MM-JJ` par les deux moteurs. Pour un niveau trié, `ordre: [{ col: 1, desc: true }]` indique la colonne (en partant de 0) sur laquelle le tri est vérifié.

## Sécurité

Les requêtes des joueurs passent par un utilisateur qui n’a que le droit `SELECT`. PostgreSQL est en plus en transaction `read-only`. Chaque requête est limitée à 3 secondes, à une seule instruction et à 1 000 lignes affichées.
