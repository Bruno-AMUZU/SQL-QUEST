// Fonctions de rendu (DOM) : tableaux, schéma, bannières, erreurs.
import { KEYWORDS } from './editor.js';

export const $ = (sel) => document.querySelector(sel);

export function el(tag, attrs = {}, ...enfants) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (k === 'text') n.textContent = v;
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const e of enfants.flat()) if (e !== null && e !== undefined) n.append(e);
  return n;
}

const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;
export { pluriel };

export function tableau({ columns, rows }, { compact = false } = {}) {
  if (!columns.length) {
    return el('p', { class: 'muted empty', text: 'La requête n’a renvoyé aucune colonne.' });
  }
  const tbody = el('tbody');
  const frag = document.createDocumentFragment();
  for (const ligne of rows) {
    frag.append(el('tr', {}, ligne.map((v) => {
      if (v === null) return el('td', { class: 'null', text: 'NULL' });
      const nombre = typeof v === 'number' || typeof v === 'bigint' || /^-?\d+(\.\d+)?$/.test(String(v));
      return el('td', { class: nombre ? 'n' : null, text: String(v) });
    })));
  }
  tbody.append(frag);
  const table = el('table', {},
    el('thead', {}, el('tr', {}, columns.map((c) => el('th', { text: c })))),
    tbody);
  const wrap = el('div', { class: `table-wrap${compact ? ' compact' : ''}` }, table);
  if (!rows.length) wrap.append(el('p', { class: 'muted empty', text: 'Aucune ligne.' }));
  return wrap;
}

export function carteTable(table, { ouverte, onToggle, onApercu }) {
  const carte = el('div', { class: `table-card${ouverte ? ' open' : ''}` });
  const entete = el('header', {
    role: 'button',
    tabindex: '0',
    'aria-expanded': String(ouverte),
    onclick: () => {
      const open = carte.classList.toggle('open');
      entete.setAttribute('aria-expanded', String(open));
      onToggle(open);
    },
    onkeydown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); entete.click(); }
    },
  },
  el('span', { class: 'chev', text: '▸' }),
  el('span', { class: 'tname', text: table.nom }),
  el('span', { class: 'tcount', text: table.lignes === null ? '' : pluriel(table.lignes, 'ligne') }));

  const cols = el('div', { class: 'cols' },
    table.colonnes.map((c) => el('div', { class: `col-row${c.pk ? ' pk' : c.ref ? ' fk' : ''}`, title: c.ref ? `${c.type} → ${c.ref}` : c.type },
      el('span', { class: 'cname', text: `${c.pk ? '🔑 ' : c.ref ? '🔗 ' : ''}${c.nom}` }),
      el('span', { class: 'ctype', text: c.ref && !c.pk ? `→ ${c.ref}` : c.type }))),
    el('button', {
      class: 'preview-btn',
      title: `SELECT * FROM ${table.nom} LIMIT 10`,
      onclick: () => onApercu(table.nom),
      text: '▶ Aperçu des 10 premières lignes',
    }));
  carte.append(entete, cols);
  return carte;
}

export function banniere(banner, { ok, titre, sousTitre, bouton }) {
  banner.hidden = false;
  banner.className = `banner${ok ? '' : ' fail'}`;
  // replaceChildren() convertirait null en texte « null » : on filtre
  banner.replaceChildren(...[
    el('span', { class: 'emoji', text: ok ? '🎉' : '💥' }),
    el('div', { class: 'texts' }, el('strong', { text: titre }), el('span', { class: 'sub', text: sousTitre })),
    bouton ? el('button', { class: `btn ${ok ? 'primary' : 'outline-red'}`, onclick: bouton.action, text: bouton.label }) : null,
  ].filter(Boolean));
}

// --- Erreurs : message natif + astuce en français ----------------------------
function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
}

function motProche(mot) {
  const u = mot.toUpperCase();
  if (u.length < 3 || KEYWORDS.includes(u)) return null;
  let meilleur = null;
  for (const k of KEYWORDS) {
    if (k.length < 3) continue;
    const dist = distance(u, k);
    if (dist <= (k.length > 5 ? 2 : 1) && (!meilleur || dist < meilleur.dist)) meilleur = { k, dist };
  }
  return meilleur?.k ?? null;
}

export function analyserErreur(message, code) {
  const m = String(message);
  const ligne = m.match(/at line (\d+)/)?.[1];
  let titre = 'Erreur SQL';
  let astuce = null;

  const pres = m.match(/near '([^']*)/) ?? m.match(/at or near "([^"]*)"/);
  if (/syntax/i.test(m)) {
    titre = `Erreur de syntaxe${ligne ? ` — ligne ${ligne}` : ''}`;
    const premierMot = pres?.[1]?.match(/[A-Za-z_]+/)?.[0];
    const suggestion = premierMot && motProche(premierMot);
    if (suggestion) astuce = `Vérifiez l’orthographe : vouliez-vous écrire « ${suggestion} » ?`;
    else if (pres && pres[1] === '') astuce = 'La requête semble incomplète : il manque peut-être la fin de l’instruction.';
    else astuce = 'Relisez l’ordre des clauses : SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY … LIMIT.';
  } else if (/Unknown column|column .* does not exist/i.test(m)) {
    titre = 'Colonne inconnue';
    astuce = 'Vérifiez le nom de la colonne (et de la table qui la contient) dans la liste à gauche.';
  } else if (/doesn't exist|relation .* does not exist/i.test(m)) {
    titre = 'Table inconnue';
    astuce = 'Vérifiez le nom de la table dans la liste à gauche.';
  } else if (/denied|read-only|permission/i.test(m) || code === 'ER_TABLEACCESS_DENIED_ERROR') {
    titre = 'Action non autorisée';
    astuce = 'Le jeu est en lecture seule : seules les requêtes de lecture (SELECT) sont permises.';
  } else if (/GROUP BY|aggregate function/i.test(m)) {
    titre = 'Problème de regroupement';
    astuce = 'Chaque colonne du SELECT doit figurer dans le GROUP BY ou dans une fonction d’agrégat (COUNT, SUM…).';
  } else if (/ambiguous/i.test(m)) {
    titre = 'Colonne ambiguë';
    astuce = 'Cette colonne existe dans plusieurs tables : préfixez-la avec le nom ou l’alias de la table (ex. p.nom).';
  } else if (/multiple commands|SELECT 2|near ';/i.test(m)) {
    astuce = 'Une seule requête à la fois, s’il vous plaît.';
  } else if (/timeout|maximum statement execution time|canceling statement/i.test(m)) {
    titre = 'Requête trop longue';
    astuce = 'La requête a dépassé 3 secondes. Vérifiez vos jointures (une condition ON manque peut-être).';
  }
  return { titre, astuce };
}

export function boiteErreur({ message, code }) {
  const { titre, astuce } = analyserErreur(message, code);
  return el('div', { class: 'error-box' },
    el('strong', { text: `⚠️ ${titre}` }),
    el('pre', { text: message }),
    astuce ? el('span', { class: 'tip', text: `💡 Astuce : ${astuce}` }) : null);
}
