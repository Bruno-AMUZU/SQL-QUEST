// Chaque niveau : la requête du joueur doit renvoyer les mêmes lignes que `solution`
// (noms de colonnes libres). `ordre` liste les colonnes (index 0-based) sur lesquelles
// le résultat doit être trié ; sans `ordre`, l'ordre des lignes est ignoré.
// Les solutions sont écrites en SQL standard, valable sur MySQL et PostgreSQL.
export default [
  {
    titre: '📚 Du plus ancien au plus récent',
    tags: ['ORDER BY'],
    enonce: 'Affichez le titre et l’année de publication de chaque livre, du plus ancien au plus récent.',
    indice: 'ORDER BY annee_publication trie par ordre croissant.',
    solution: 'SELECT titre, annee_publication FROM livres ORDER BY annee_publication',
    ordre: [{ col: 1 }],
  },
  {
    titre: '🔢 Une histoire de 84',
    tags: ['LIKE'],
    enonce: 'Deux titres contiennent « 84 ». Affichez-les.',
    indice: 'titre LIKE \'%84%\' cherche « 84 » n’importe où dans le texte.',
    solution: "SELECT titre FROM livres WHERE titre LIKE '%84%'",
  },
  {
    titre: '✍️ Toujours à l’écriture',
    tags: ['IS NULL'],
    enonce: 'Affichez le nom des auteurs encore vivants (sans année de décès).',
    indice: 'annee_deces IS NULL.',
    solution: 'SELECT nom FROM auteurs WHERE annee_deces IS NULL',
  },
  {
    titre: '⏳ Une vie d’écriture',
    tags: ['CALCUL', 'ORDER BY'],
    enonce: 'Pour chaque auteur décédé, affichez son nom et la différence entre son année de décès et son année de naissance, de la plus grande à la plus petite.',
    indice: 'On peut calculer dans le SELECT : annee_deces - annee_naissance. Les vivants donnent NULL : filtrez-les.',
    solution: `SELECT nom, annee_deces - annee_naissance AS duree
FROM auteurs
WHERE annee_deces IS NOT NULL
ORDER BY duree DESC`,
    ordre: [{ col: 1, desc: true }],
  },
  {
    titre: '🇬🇧 So British',
    tags: ['JOIN'],
    enonce: 'Affichez le titre et le nom de l’auteur de chaque livre écrit par un auteur de nationalité « Britannique ».',
    indice: 'Joignez livres et auteurs (a.id = l.auteur_id) puis filtrez sur a.nationalite.',
    solution: `SELECT l.titre, a.nom
FROM livres l
JOIN auteurs a ON a.id = l.auteur_id
WHERE a.nationalite = 'Britannique'`,
  },
  {
    titre: '🌐 Tour du monde',
    tags: ['COUNT DISTINCT'],
    enonce: 'Combien de nationalités différentes compte-t-on parmi les auteurs ? Renvoyez un seul nombre.',
    indice: 'COUNT(DISTINCT nationalite) ne compte chaque valeur qu’une fois.',
    solution: 'SELECT COUNT(DISTINCT nationalite) FROM auteurs',
  },
  {
    titre: '📖 Pas encore rendus',
    tags: ['JOIN', 'IS NULL'],
    enonce: 'Affichez le titre du livre et le prénom de l’adhérent pour chaque emprunt en cours (pas encore rendu).',
    indice: 'Joignez emprunts, livres et adherents, puis filtrez sur date_retour IS NULL.',
    solution: `SELECT l.titre, ad.prenom
FROM emprunts e
JOIN livres l ON l.id = e.livre_id
JOIN adherents ad ON ad.id = e.adherent_id
WHERE e.date_retour IS NULL`,
  },
  {
    titre: '🔥 Le podium',
    tags: ['GROUP BY', 'LIMIT'],
    enonce: 'Affichez le titre et le nombre d’emprunts des 3 livres les plus empruntés, du plus emprunté au moins emprunté.',
    indice: 'Joignez emprunts et livres, regroupez par livre, triez par COUNT(*) décroissant et gardez 3 lignes.',
    solution: `SELECT l.titre, COUNT(*) AS nb
FROM emprunts e
JOIN livres l ON l.id = e.livre_id
GROUP BY l.id, l.titre
ORDER BY nb DESC
LIMIT 3`,
    ordre: [{ col: 1, desc: true }],
  },
  {
    titre: '🕸️ Sur l’étagère du fond',
    tags: ['LEFT JOIN', 'IS NULL'],
    enonce: 'Affichez le titre des livres qui n’ont jamais été empruntés.',
    indice: 'LEFT JOIN emprunts depuis livres : les livres sans emprunt ont alors e.id NULL. Filtrez avec WHERE e.id IS NULL.',
    solution: `SELECT l.titre
FROM livres l
LEFT JOIN emprunts e ON e.livre_id = l.id
WHERE e.id IS NULL`,
  },
  {
    titre: '🎉 Liste d’invités',
    tags: ['UNION', 'CONCAT'],
    enonce: 'Pour sa fête annuelle, la médiathèque invite tous les adhérents et les auteurs encore vivants. Affichez une seule colonne de noms : « prénom nom » pour les adhérents, le nom pour les auteurs.',
    indice: 'Deux SELECT d’une colonne chacun, réunis par UNION. Pour les adhérents : CONCAT(prenom, \' \', nom).',
    solution: `SELECT CONCAT(prenom, ' ', nom) FROM adherents
UNION
SELECT nom FROM auteurs WHERE annee_deces IS NULL`,
  },
  {
    titre: '🥇 Premier chef-d’œuvre',
    tags: ['SOUS-REQUÊTE CORRÉLÉE'],
    enonce: 'Pour chaque auteur, affichez son nom et le titre de son livre le plus ancien présent dans le fonds.',
    indice: 'Une sous-requête peut utiliser la ligne courante : l.annee_publication = (SELECT MIN(l2.annee_publication) FROM livres l2 WHERE l2.auteur_id = l.auteur_id).',
    solution: `SELECT a.nom, l.titre
FROM livres l
JOIN auteurs a ON a.id = l.auteur_id
WHERE l.annee_publication = (
  SELECT MIN(l2.annee_publication) FROM livres l2 WHERE l2.auteur_id = l.auteur_id
)`,
  },
  {
    titre: '🛸 Les rêveurs du futur',
    tags: ['EXISTS'],
    enonce: 'Affichez le prénom et le nom des adhérents ayant emprunté au moins un livre de genre « Science-fiction ».',
    indice: 'WHERE EXISTS (SELECT 1 FROM emprunts e JOIN livres l ON … WHERE e.adherent_id = ad.id AND l.genre = …).',
    solution: `SELECT ad.prenom, ad.nom
FROM adherents ad
WHERE EXISTS (
  SELECT 1 FROM emprunts e
  JOIN livres l ON l.id = e.livre_id
  WHERE e.adherent_id = ad.id AND l.genre = 'Science-fiction'
)`,
  },
  {
    titre: '🎭 Lecteurs éclectiques',
    tags: ['HAVING', 'COUNT DISTINCT'],
    enonce: 'Affichez le prénom des adhérents ayant emprunté des livres d’au moins 4 genres différents, avec ce nombre de genres.',
    indice: 'Regroupez par adhérent puis HAVING COUNT(DISTINCT l.genre) >= 4.',
    solution: `SELECT ad.prenom, COUNT(DISTINCT l.genre) AS nb_genres
FROM adherents ad
JOIN emprunts e ON e.adherent_id = ad.id
JOIN livres l ON l.id = e.livre_id
GROUP BY ad.id, ad.prenom
HAVING COUNT(DISTINCT l.genre) >= 4`,
  },
  {
    titre: '🏛️ Siècle par siècle',
    tags: ['CASE', 'GROUP BY'],
    enonce: 'Affichez le nombre de livres par siècle de publication, avec les libellés « XIXe », « XXe » et « XXIe ».',
    indice: 'Construisez le libellé avec CASE WHEN annee_publication < 1901 THEN \'XIXe\' … END, puis regroupez par cette même expression.',
    solution: `SELECT CASE
    WHEN annee_publication < 1901 THEN 'XIXe'
    WHEN annee_publication < 2001 THEN 'XXe'
    ELSE 'XXIe'
  END AS siecle, COUNT(*) AS nb
FROM livres
GROUP BY CASE
    WHEN annee_publication < 1901 THEN 'XIXe'
    WHEN annee_publication < 2001 THEN 'XXe'
    ELSE 'XXIe'
  END`,
  },
  {
    titre: '📊 Au-dessus de la moyenne',
    tags: ['WITH'],
    enonce: 'Affichez le prénom et le nombre d’emprunts des adhérents qui ont emprunté plus que la moyenne des emprunteurs.',
    indice: 'Un WITH calcule d’abord le nombre d’emprunts par adhérent ; la requête principale compare ensuite à (SELECT AVG(nb) FROM …).',
    solution: `WITH stats AS (
  SELECT ad.prenom, COUNT(*) AS nb
  FROM emprunts e
  JOIN adherents ad ON ad.id = e.adherent_id
  GROUP BY ad.id, ad.prenom
)
SELECT prenom, nb FROM stats
WHERE nb > (SELECT AVG(nb) FROM stats)`,
  },
  {
    titre: '🏅 Le palmarès des genres',
    tags: ['RANK', 'OVER'],
    enonce: 'Affichez chaque genre emprunté, son nombre d’emprunts et son rang (1 = le plus emprunté). Deux genres ex aequo ont le même rang et le suivant saute une place. Triez par rang.',
    indice: 'RANK() OVER (ORDER BY COUNT(*) DESC) attribue un rang après le GROUP BY.',
    solution: `SELECT l.genre, COUNT(*) AS nb, RANK() OVER (ORDER BY COUNT(*) DESC) AS rang
FROM emprunts e
JOIN livres l ON l.id = e.livre_id
GROUP BY l.genre
ORDER BY rang`,
    ordre: [{ col: 2 }],
  },
];
