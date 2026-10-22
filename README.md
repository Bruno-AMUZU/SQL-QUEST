# SQL QUEST

Un jeu pour apprendre le SQL dans l’esprit de [Flexbox Froggy](https://flexboxfroggy.com/#fr) : on choisit une base de données, on lit la question et on écrit la requête qui produit le résultat attendu. Le jeu tourne sur **MySQL** (par défaut) et sur **PostgreSQL**, avec de vrais serveurs.

- **Mode jeu** : 16 niveaux progressifs, de `SELECT *` jusqu’à `LEFT JOIN`. La requête du joueur est comparée à une solution cachée : mêmes lignes et mêmes valeurs, alias de colonnes libres, ordre vérifié seulement quand la question demande un tri. En cas de réussite, des confettis ; en cas d’échec, l’éditeur tremble et le jeu explique la raison.
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

`npm run check` exécute la solution de chaque niveau sur les deux moteurs et vérifie que l’écriture est bien refusée.

## Organisation

```
data/
  bases.js                 registre des bases
  coupe_du_monde/
    schema.js              tables (définition neutre, traduite pour MySQL et PostgreSQL)
    donnees.js             données réelles 1930 – 2022
    niveaux.js             questions, indices et solutions
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

Écrivez les solutions en SQL standard (sans backticks ni `LIMIT x, y`) pour qu’elles fonctionnent sur les deux moteurs. Pour un niveau trié, `ordre: [{ col: 1, desc: true }]` indique la colonne (en partant de 0) sur laquelle le tri est vérifié.

## Sécurité

Les requêtes des joueurs passent par un utilisateur qui n’a que le droit `SELECT`. PostgreSQL est en plus en transaction `read-only`. Chaque requête est limitée à 3 secondes, à une seule instruction et à 1 000 lignes affichées.
