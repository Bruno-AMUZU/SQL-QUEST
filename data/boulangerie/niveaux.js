// Chaque niveau : la requête du joueur doit renvoyer les mêmes lignes que `solution`
// (noms de colonnes libres). `ordre` liste les colonnes (index 0-based) sur lesquelles
// le résultat doit être trié ; sans `ordre`, l'ordre des lignes est ignoré.
// Les solutions sont écrites en SQL standard, valable sur MySQL et PostgreSQL.
export default [
  {
    titre: '🥖 La vitrine',
    tags: ['SELECT'],
    enonce: 'Affichez le nom et le prix de chaque produit.',
    indice: 'Listez les colonnes voulues séparées par des virgules après SELECT.',
    solution: 'SELECT nom, prix FROM produits',
  },
  {
    titre: '🪙 Petits prix',
    tags: ['WHERE', 'ORDER BY'],
    enonce: 'Affichez le nom et le prix des produits à moins de 2 €, du moins cher au plus cher.',
    indice: 'WHERE prix < 2 filtre, ORDER BY prix trie par ordre croissant.',
    solution: 'SELECT nom, prix FROM produits WHERE prix < 2 ORDER BY prix',
    ordre: [{ col: 1 }],
  },
  {
    titre: '🧺 Pain ou boisson',
    tags: ['IN'],
    enonce: 'Affichez le nom des produits de catégorie « Pain » ou « Boisson ».',
    indice: 'categorie IN (\'Pain\', \'Boisson\') évite d’enchaîner les OR.',
    solution: "SELECT nom FROM produits WHERE categorie IN ('Pain', 'Boisson')",
  },
  {
    titre: '🏷️ Nom complet',
    tags: ['CONCAT'],
    enonce: 'Affichez, dans une seule colonne, le prénom et le nom des clients lyonnais séparés par une espace (ex. « Camille Martin »).',
    indice: 'CONCAT(prenom, \' \', nom) colle plusieurs textes bout à bout.',
    solution: "SELECT CONCAT(prenom, ' ', nom) FROM clients WHERE ville = 'Lyon'",
  },
  {
    titre: '📭 Pas d’email ?',
    tags: ['COALESCE'],
    enonce: 'Affichez le prénom et l’email de chaque client ; quand l’email est vide, affichez « aucun » à la place.',
    indice: 'COALESCE(email, \'aucun\') renvoie la première valeur non NULL.',
    solution: "SELECT prenom, COALESCE(email, 'aucun') FROM clients",
  },
  {
    titre: '📆 La promo 2024',
    tags: ['DATE', 'BETWEEN'],
    enonce: 'Affichez le prénom et le nom des clients inscrits en 2024.',
    indice: 'Les dates s’écrivent comme du texte au format \'AAAA-MM-JJ\' : date_inscription BETWEEN \'2024-01-01\' AND \'2024-12-31\'.',
    solution: "SELECT prenom, nom FROM clients WHERE date_inscription BETWEEN '2024-01-01' AND '2024-12-31'",
  },
  {
    titre: '🗺️ D’où viennent-ils ?',
    tags: ['GROUP BY', 'COUNT'],
    enonce: 'Affichez chaque ville avec son nombre de clients, de la plus représentée à la moins représentée.',
    indice: 'GROUP BY ville, COUNT(*), puis ORDER BY sur ce nombre décroissant.',
    solution: 'SELECT ville, COUNT(*) AS nb FROM clients GROUP BY ville ORDER BY nb DESC',
    ordre: [{ col: 1, desc: true }],
  },
  {
    titre: '🧾 Le ticket de caisse',
    tags: ['JOIN', 'CALCUL'],
    enonce: 'Pour la commande n°7, affichez le nom de chaque produit acheté et son montant (prix × quantité).',
    indice: 'Joignez lignes et produits, puis calculez p.prix * l.quantite dans le SELECT.',
    solution: `SELECT p.nom, p.prix * l.quantite AS montant
FROM lignes l
JOIN produits p ON p.id = l.produit_id
WHERE l.commande_id = 7`,
  },
  {
    titre: '💶 Le chiffre d’affaires',
    tags: ['SUM'],
    enonce: 'Quel est le chiffre d’affaires total du trimestre ? Renvoyez un seul nombre.',
    indice: 'SUM(p.prix * l.quantite) additionne les montants de toutes les lignes.',
    solution: `SELECT SUM(p.prix * l.quantite)
FROM lignes l
JOIN produits p ON p.id = l.produit_id`,
  },
  {
    titre: '🍰 Le rayon qui rapporte',
    tags: ['SUM', 'GROUP BY'],
    enonce: 'Affichez le chiffre d’affaires de chaque catégorie, de la plus rentable à la moins rentable.',
    indice: 'Même calcul qu’au niveau précédent, regroupé par p.categorie et trié décroissant.',
    solution: `SELECT p.categorie, SUM(p.prix * l.quantite) AS ca
FROM lignes l
JOIN produits p ON p.id = l.produit_id
GROUP BY p.categorie
ORDER BY ca DESC`,
    ordre: [{ col: 1, desc: true }],
  },
  {
    titre: '👩‍🍳 Qui est le chef ?',
    tags: ['AUTO-JOINTURE'],
    enonce: 'Affichez le prénom de chaque employé et le prénom de son responsable (la gérante, sans responsable, n’apparaît pas).',
    indice: 'Joignez employes à elle-même avec deux alias : JOIN employes r ON r.id = e.responsable_id.',
    solution: `SELECT e.prenom, r.prenom
FROM employes e
JOIN employes r ON r.id = e.responsable_id`,
  },
  {
    titre: '👻 Inscrit mais jamais venu',
    tags: ['NOT EXISTS'],
    enonce: 'Affichez le prénom et le nom des clients qui n’ont jamais passé de commande.',
    indice: 'WHERE NOT EXISTS (SELECT 1 FROM commandes co WHERE co.client_id = c.id) garde les clients sans commande.',
    solution: `SELECT prenom, nom FROM clients c
WHERE NOT EXISTS (SELECT 1 FROM commandes co WHERE co.client_id = c.id)`,
  },
  {
    titre: '🛎️ Au comptoir',
    tags: ['LEFT JOIN', 'GROUP BY'],
    enonce: 'Affichez le prénom de chaque employé et le nombre de commandes qu’il a servies, y compris 0.',
    indice: 'LEFT JOIN commandes depuis employes, puis COUNT(co.id) pour compter 0 quand il n’y a rien.',
    solution: `SELECT e.prenom, COUNT(co.id) AS nb
FROM employes e
LEFT JOIN commandes co ON co.employe_id = e.id
GROUP BY e.id, e.prenom`,
  },
  {
    titre: '📈 Mois par mois',
    tags: ['EXTRACT', 'GROUP BY'],
    enonce: 'Affichez le numéro de chaque mois et son chiffre d’affaires, dans l’ordre des mois.',
    indice: 'EXTRACT(MONTH FROM co.date_commande) donne le mois. Joignez commandes, lignes et produits, regroupez par mois et triez.',
    solution: `SELECT EXTRACT(MONTH FROM co.date_commande) AS mois, SUM(p.prix * l.quantite) AS ca
FROM commandes co
JOIN lignes l ON l.commande_id = co.id
JOIN produits p ON p.id = l.produit_id
GROUP BY EXTRACT(MONTH FROM co.date_commande)
ORDER BY mois`,
    ordre: [{ col: 0 }],
  },
  {
    titre: '⭐ Les fidèles',
    tags: ['HAVING'],
    enonce: 'Affichez le prénom et le nom des clients ayant dépensé plus de 25 € au total, avec leur total.',
    indice: 'Regroupez par client puis filtrez les groupes avec HAVING SUM(p.prix * l.quantite) > 25.',
    solution: `SELECT c.prenom, c.nom, SUM(p.prix * l.quantite) AS total
FROM clients c
JOIN commandes co ON co.client_id = c.id
JOIN lignes l ON l.commande_id = co.id
JOIN produits p ON p.id = l.produit_id
GROUP BY c.id, c.prenom, c.nom
HAVING SUM(p.prix * l.quantite) > 25`,
  },
  {
    titre: '🏆 Le chouchou de chaque rayon',
    tags: ['WITH', 'RANK'],
    enonce: 'Pour chaque catégorie, affichez la catégorie, le produit le plus vendu (en quantité) et cette quantité.',
    indice: 'Dans un WITH, calculez la quantité par produit et RANK() OVER (PARTITION BY categorie ORDER BY quantité DESC) ; gardez ensuite le rang 1.',
    solution: `WITH ventes AS (
  SELECT p.categorie, p.nom, SUM(l.quantite) AS qte,
    RANK() OVER (PARTITION BY p.categorie ORDER BY SUM(l.quantite) DESC) AS rang
  FROM lignes l
  JOIN produits p ON p.id = l.produit_id
  GROUP BY p.categorie, p.id, p.nom
)
SELECT categorie, nom, qte FROM ventes WHERE rang = 1`,
  },
];
