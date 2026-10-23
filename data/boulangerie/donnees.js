// Données fictives d'une boulangerie lyonnaise, premier trimestre 2025.
// Les commandes sont écrites avec leur détail { produit_id: quantité } pour rester
// lisibles ; on en tire les tables commandes et lignes en bas du fichier.

const produits = [
  // [nom, categorie, prix]
  ['Baguette tradition', 'Pain', 1.30],
  ['Pain de campagne', 'Pain', 3.20],
  ['Pain aux céréales', 'Pain', 3.60],
  ['Croissant', 'Viennoiserie', 1.20],
  ['Pain au chocolat', 'Viennoiserie', 1.40],
  ['Chausson aux pommes', 'Viennoiserie', 1.90],
  ['Éclair au chocolat', 'Pâtisserie', 3.10],
  ['Tarte au citron', 'Pâtisserie', 3.80],
  ['Paris-Brest', 'Pâtisserie', 4.50],
  ['Mille-feuille', 'Pâtisserie', 3.90],
  ['Café', 'Boisson', 1.80],
  ['Jus d’orange', 'Boisson', 2.90],
  ['Kouign-amann', 'Viennoiserie', 2.60],
];

const clients = [
  // [prenom, nom, ville, date_inscription, email]
  ['Camille', 'Martin', 'Lyon', '2023-01-15', 'camille.martin@mail.fr'],
  ['Hugo', 'Bernard', 'Lyon', '2023-02-03', null],
  ['Léa', 'Dubois', 'Villeurbanne', '2023-05-20', 'lea.dubois@mail.fr'],
  ['Nathan', 'Petit', 'Lyon', '2023-11-08', 'nathan.petit@mail.fr'],
  ['Chloé', 'Robert', 'Bron', '2024-01-22', null],
  ['Louis', 'Richard', 'Villeurbanne', '2024-03-10', 'louis.r@mail.fr'],
  ['Manon', 'Durand', 'Lyon', '2024-06-01', 'manon.durand@mail.fr'],
  ['Jules', 'Moreau', 'Caluire', '2024-09-17', null],
  ['Zoé', 'Laurent', 'Lyon', '2025-01-05', 'zoe.laurent@mail.fr'],
  ['Gabriel', 'Simon', 'Bron', '2025-02-11', null],
];

const employes = [
  // [prenom, poste, responsable_id, date_embauche]
  ['Hélène', 'Gérante', null, '2015-03-02'],
  ['Karim', 'Chef boulanger', 1, '2016-09-12'],
  ['Sophie', 'Cheffe pâtissière', 1, '2018-01-08'],
  ['Lucas', 'Apprenti boulanger', 2, '2023-09-04'],
  ['Inès', 'Vendeuse', 1, '2021-06-14'],
  ['Tom', 'Vendeur', 1, '2024-02-19'],
  ['Maëlle', 'Apprentie pâtissière', 3, '2024-09-02'],
];

const commandes = [
  // [date_commande, client_id, employe_id, { produit_id: quantite }]
  ['2025-01-04', 1, 5, { 1: 2, 4: 3 }],
  ['2025-01-04', 2, 5, { 1: 1 }],
  ['2025-01-05', 3, 1, { 9: 1, 11: 2 }],
  ['2025-01-08', 4, 6, { 5: 4, 12: 2 }],
  ['2025-01-11', 1, 5, { 2: 1, 8: 2 }],
  ['2025-01-12', 5, 6, { 1: 3 }],
  ['2025-01-15', 6, 5, { 4: 6, 5: 6 }],
  ['2025-01-18', 7, 1, { 10: 2, 11: 1 }],
  ['2025-01-19', 2, 6, { 1: 2, 6: 1 }],
  ['2025-01-25', 9, 5, { 7: 3 }],
  ['2025-02-01', 1, 6, { 1: 2, 4: 2, 11: 2 }],
  ['2025-02-02', 3, 5, { 3: 1 }],
  ['2025-02-07', 8, 6, { 9: 2 }],
  ['2025-02-08', 4, 5, { 1: 1, 5: 2 }],
  ['2025-02-09', 6, 1, { 7: 1, 8: 1, 10: 1 }],
  ['2025-02-14', 7, 5, { 9: 1, 12: 2 }],
  ['2025-02-14', 9, 6, { 8: 2 }],
  ['2025-02-15', 2, 5, { 1: 2 }],
  ['2025-02-21', 5, 6, { 2: 1, 6: 2 }],
  ['2025-02-22', 1, 5, { 1: 3, 5: 3 }],
  ['2025-03-01', 3, 6, { 4: 4, 11: 2 }],
  ['2025-03-02', 6, 5, { 1: 2, 3: 1 }],
  ['2025-03-07', 4, 1, { 7: 2, 12: 1 }],
  ['2025-03-08', 7, 6, { 1: 1, 4: 2, 5: 2 }],
  ['2025-03-14', 8, 5, { 10: 3 }],
  ['2025-03-15', 2, 6, { 1: 2, 6: 1 }],
  ['2025-03-21', 1, 5, { 8: 1, 9: 1 }],
  ['2025-03-22', 9, 6, { 1: 4 }],
  ['2025-03-28', 5, 5, { 4: 2, 11: 1 }],
  ['2025-03-29', 6, 6, { 2: 2, 7: 1 }],
];

// --- Conversion en lignes ---------------------------------------------------
export default {
  produits: produits.map((p, i) => [i + 1, ...p]),
  clients: clients.map((c, i) => [i + 1, ...c]),
  employes: employes.map((e, i) => [i + 1, ...e]),
  commandes: commandes.map(([date, client, employe], i) => [i + 1, client, employe, date]),
  lignes: commandes.flatMap(([, , , detail], i) =>
    Object.entries(detail).map(([produit, quantite]) => [i + 1, Number(produit), quantite])),
};
