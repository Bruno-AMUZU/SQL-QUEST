import { store } from './store.js';
import { creerEditeur } from './editor.js';
import { $, el, pluriel, tableau, carteTable, banniere, boiteErreur } from './render.js';
import { confettis, echec } from './effects.js';

const NOMS_SGBD = { mysql: 'MySQL 8.4', postgres: 'PostgreSQL 16' };
const mobile = matchMedia('(max-width: 900px)');

const etat = {
  bases: [],
  base: null,        // { id, nom, icone, exemples, … }
  tables: [],
  niveaux: [],
  niveau: 0,         // index du niveau affiché
  sgbd: store.get('sgbd', 'mysql'),
  mode: store.get('mode', 'jeu'),
  enCours: false,
};

// --- API ---------------------------------------------------------------------
async function api(chemin, corps) {
  const res = await fetch(chemin, corps ? {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corps),
  } : undefined);
  const json = await res.json().catch(() => ({}));
  if (!res.ok && !json.erreur) throw new Error(`Erreur serveur (${res.status})`);
  return json;
}

// --- Éditeur -----------------------------------------------------------------
const editeur = creerEditeur({
  textarea: $('#sql'),
  highlight: $('#highlight'),
  gutter: $('#gutter'),
  onRun: () => executer(),
  onChange: (sql) => sauverBrouillon(sql),
});

function sauverBrouillon(sql) {
  if (!etat.base) return;
  if (etat.mode === 'jeu') {
    const brouillons = store.getBase(etat.base.id, 'brouillons', {});
    brouillons[etat.niveau] = sql;
    store.setBase(etat.base.id, 'brouillons', brouillons);
  } else {
    store.setBase(etat.base.id, 'sandbox', sql);
  }
}

function chargerBrouillon() {
  const sql = etat.mode === 'jeu'
    ? store.getBase(etat.base.id, 'brouillons', {})[etat.niveau] ?? ''
    : store.getBase(etat.base.id, 'sandbox', etat.base.exemples?.[0]?.sql ?? '');
  editeur.charger(sql);
}

// --- Progression ---------------------------------------------------------------
const reussis = () => new Set(store.getBase(etat.base.id, 'reussis', []));
function marquerReussi(index) {
  const r = reussis();
  r.add(index);
  store.setBase(etat.base.id, 'reussis', [...r]);
}

// --- Rendu des préférences -----------------------------------------------------
function appliquerTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('#theme-btn').textContent = theme === 'dark' ? '🌙' : '☀️';
  $('#theme-btn').title = theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre';
  document.querySelectorAll('[data-theme-choice]').forEach((b) =>
    b.classList.toggle('active', b.dataset.themeChoice === theme));
}

function appliquerSgbd() {
  document.body.dataset.sgbd = etat.sgbd;
  document.querySelectorAll('[data-sgbd]').forEach((b) =>
    b.classList.toggle('active', b.dataset.sgbd === etat.sgbd));
  $('#sgbd-select').value = etat.sgbd;
  $('#engine-label').textContent = NOMS_SGBD[etat.sgbd];
}

function appliquerMode() {
  document.body.dataset.mode = etat.mode;
  document.querySelectorAll('[data-mode]').forEach((b) =>
    b.classList.toggle('active', b.dataset.mode === etat.mode));
}

// --- Sidebar : bases et tables ------------------------------------------------
const tablesOuvertes = new Set(store.get('tablesOuvertes', null) ?? ['pays', 'editions']);

function rendreTables() {
  $('#tables').replaceChildren(...etat.tables.map((t) => carteTable(t, {
    ouverte: tablesOuvertes.has(t.nom),
    onToggle: (open) => {
      if (open) tablesOuvertes.add(t.nom); else tablesOuvertes.delete(t.nom);
      store.set('tablesOuvertes', [...tablesOuvertes]);
    },
    onApercu: (nom) => {
      fermerTiroir();
      editeur.remplacer(`SELECT * FROM ${nom} LIMIT 10;`);
      if (etat.mode === 'sandbox') executer();
    },
  })));
  $('#tables-count').textContent = etat.tables.length;
  $('#base-button-meta').textContent = `${pluriel(etat.tables.length, 'table')}  ▾`;
}

async function chargerSchema() {
  const schema = await api(`/api/bases/${etat.base.id}/schema?sgbd=${etat.sgbd}`);
  etat.tables = schema.tables;
  rendreTables();
}

async function choisirBase(id) {
  etat.base = etat.bases.find((b) => b.id === id) ?? etat.bases[0];
  store.set('base', etat.base.id);
  $('#base-select').value = etat.base.id;
  $('#base-icon').textContent = etat.base.icone;
  $('#base-button-icon').textContent = etat.base.icone;
  $('#base-button-name').textContent = etat.base.nom;
  $('#sandbox-base-name').textContent = `« ${etat.base.nom} »`;
  $('#examples').replaceChildren(...etat.base.exemples.map((ex) =>
    el('button', { class: 'chip', text: ex.label, onclick: () => { editeur.remplacer(ex.sql); executer(); } })));

  const [niveaux] = await Promise.all([api(`/api/bases/${etat.base.id}/niveaux`), chargerSchema()]);
  etat.niveaux = niveaux;
  etat.niveau = Math.min(store.getBase(etat.base.id, 'niveau', 0), niveaux.length - 1);
  rendreHistorique();
  afficherVue();
}

// --- Mode jeu : niveaux ---------------------------------------------------------
function rendreNiveau() {
  const n = etat.niveaux[etat.niveau];
  const total = etat.niveaux.length;
  const faits = reussis();

  $('#level-title').textContent = `Niveau ${etat.niveau + 1} / ${total}`;
  $('#prev-level').disabled = etat.niveau === 0;
  $('#next-level').disabled = etat.niveau === total - 1;
  $('#level-dots').replaceChildren(...etat.niveaux.map((_, i) => el('button', {
    class: `dot-btn${faits.has(i) ? ' done' : ''}${i === etat.niveau ? ' current' : ''}`,
    text: String(i + 1),
    title: etat.niveaux[i].titre,
    'aria-label': `Niveau ${i + 1}${faits.has(i) ? ' (réussi)' : ''}`,
    'aria-current': i === etat.niveau ? 'step' : null,
    onclick: () => allerAuNiveau(i),
  })));

  $('#q-tags').replaceChildren(...n.tags.map((t) => el('span', { class: 'tag', text: t })));
  $('#q-title').textContent = n.titre;
  $('#q-text').textContent = n.enonce;
  const hint = $('#hint-btn');
  hint.classList.remove('revealed');
  $('#hint-text').textContent = 'Afficher l’indice';
  hint.onclick = () => {
    hint.classList.add('revealed');
    $('#hint-text').textContent = `Indice : ${n.indice}`;
  };
  chargerAttendu();
}

async function chargerAttendu() {
  const index = etat.niveau;
  const cible = $('#expected-table');
  cible.replaceChildren(el('p', { class: 'muted empty', text: 'Chargement…' }));
  try {
    const r = await api(`/api/bases/${etat.base.id}/niveaux/${index + 1}/attendu?sgbd=${etat.sgbd}`);
    if (index !== etat.niveau) return;
    if (r.erreur) throw new Error(r.erreur);
    $('#expected-meta').textContent = pluriel(r.rows.length, 'ligne');
    cible.replaceChildren(tableau(r, { compact: true }));
  } catch (e) {
    cible.replaceChildren(el('p', { class: 'err-text small', text: `Impossible de charger le résultat attendu : ${e.message}` }));
  }
}

function allerAuNiveau(i) {
  etat.niveau = Math.max(0, Math.min(i, etat.niveaux.length - 1));
  store.setBase(etat.base.id, 'niveau', etat.niveau);
  afficherVue();
  scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Historique (bac à sable) -----------------------------------------------------
function rendreHistorique() {
  const items = store.getBase(etat.base.id, 'historique', []);
  const maintenant = Date.now();
  const quand = (t) => {
    const min = Math.round((maintenant - t) / 60000);
    if (min < 1) return 'à l’instant';
    if (min < 60) return `il y a ${min} min`;
    const h = Math.round(min / 60);
    return h < 24 ? `il y a ${h} h` : `il y a ${Math.round(h / 24)} j`;
  };
  $('#history-list').replaceChildren(...(items.length ? items.map((it) => el('li', {},
    el('button', { onclick: () => editeur.remplacer(it.sql), title: it.sql },
      el('span', { class: 'q', text: it.sql.replace(/\s+/g, ' ') }),
      el('span', { class: `m ${it.ok ? 'ok-text' : 'err-text'}`, text: `${it.ok ? '✓' : '✕'} ${it.info} · ${quand(it.t)}` }))))
    : [el('li', { class: 'muted small', text: 'Vos requêtes apparaîtront ici.' })]));
}

function ajouterHistorique(sql, ok, info) {
  const items = store.getBase(etat.base.id, 'historique', []).filter((it) => it.sql !== sql);
  items.unshift({ sql, ok, info, t: Date.now() });
  store.setBase(etat.base.id, 'historique', items.slice(0, 20));
  rendreHistorique();
}

// --- Résultats -------------------------------------------------------------------
function reinitialiserResultat() {
  $('#banner').hidden = true;
  $('#editor').classList.remove('error', 'success');
  $('#result-title').textContent = etat.mode === 'jeu' ? 'Votre résultat' : 'Résultat';
  $('#result-meta').textContent = '';
  $('#result-meta').className = 'small';
  $('#result-body').replaceChildren(el('p', { class: 'muted empty', text: 'Exécutez une requête pour voir le résultat ici.' }));
}

function afficherResultat(r) {
  const meta = `${pluriel(r.total ?? r.rows.length, 'ligne')} · ${pluriel(r.columns.length, 'colonne')} · ${r.duration} ms`;
  $('#result-meta').textContent = etat.mode === 'sandbox' ? `✓ ${meta}` : meta;
  $('#result-meta').className = `small${etat.mode === 'sandbox' ? ' ok-text' : ''}`;
  const corps = [tableau(r)];
  if (r.truncated) corps.push(el('p', { class: 'muted small truncated', text: `Seules les ${r.rows.length} premières lignes sont affichées.` }));
  $('#result-body').replaceChildren(...corps);
}

function afficherErreur(erreur) {
  $('#result-meta').textContent = '✕ La requête n’a pas pu être exécutée';
  $('#result-meta').className = 'small err-text';
  $('#result-body').replaceChildren(boiteErreur(erreur));
  $('#editor').classList.add('error');
}

async function executer() {
  const sql = editeur.valeur.trim();
  if (!sql || etat.enCours) return;
  etat.enCours = true;
  const bouton = $('#run-btn');
  bouton.disabled = true;
  reinitialiserResultat();
  try {
    if (etat.mode === 'sandbox') await executerBacASable(sql);
    else await executerNiveau(sql);
  } catch (e) {
    afficherErreur({ message: e.message });
  } finally {
    etat.enCours = false;
    bouton.disabled = false;
    if (mobile.matches) $('#result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

async function executerBacASable(sql) {
  const r = await api('/api/query', { sgbd: etat.sgbd, base: etat.base.id, sql });
  if (r.erreur) {
    afficherErreur(r.erreur);
    ajouterHistorique(sql, false, 'Erreur');
    return;
  }
  afficherResultat(r);
  ajouterHistorique(sql, true, pluriel(r.total, 'ligne'));
}

async function executerNiveau(sql) {
  const index = etat.niveau;
  const r = await api('/api/valider', { sgbd: etat.sgbd, base: etat.base.id, niveau: index + 1, sql });
  const banner = $('#banner');
  const zone = $('#result');

  if (r.erreur && !r.resultat) {
    afficherErreur(r.erreur);
    banniere(banner, {
      ok: false,
      titre: 'Oups, la requête a échoué',
      sousTitre: r.erreur.message ?? String(r.erreur),
    });
    echec($('#editor'), zone);
    return;
  }

  afficherResultat(r.resultat);
  if (r.ok) {
    marquerReussi(index);
    $('#editor').classList.add('success');
    const dernier = index === etat.niveaux.length - 1;
    const tousFaits = reussis().size === etat.niveaux.length;
    banniere(banner, {
      ok: true,
      titre: tousFaits && dernier ? '🏁 Bravo, vous avez terminé tous les niveaux !' : `Bravo ! Niveau ${index + 1} réussi`,
      sousTitre: `${r.raison} · ${r.resultat.duration} ms`,
      bouton: dernier ? null : { label: 'Niveau suivant →', action: () => allerAuNiveau(index + 1) },
    });
    rendreProgression();
    confettis();
  } else {
    $('#editor').classList.add('error');
    banniere(banner, {
      ok: false,
      titre: 'Pas tout à fait…',
      sousTitre: r.raison.charAt(0).toUpperCase() + r.raison.slice(1),
      bouton: { label: '💡 Voir l’indice', action: () => { $('#hint-btn').click(); $('.question').scrollIntoView({ behavior: 'smooth' }); } },
    });
    echec($('#editor'), zone);
  }
}

// Met à jour pastilles et barre sans recharger l'énoncé ni le résultat
function rendreProgression() {
  const faits = reussis();
  document.querySelectorAll('.dot-btn').forEach((b, i) => b.classList.toggle('done', faits.has(i)));
  $('#progress-fill').style.width = `${(faits.size / etat.niveaux.length) * 100}%`;
  $('#level-done').textContent = `${faits.size} niveau${faits.size > 1 ? 'x réussis' : ' réussi'}`;
}

// --- Vue globale -------------------------------------------------------------------
function afficherVue() {
  appliquerMode();
  reinitialiserResultat();
  chargerBrouillon();
  if (etat.mode === 'jeu' && etat.niveaux.length) {
    rendreNiveau();
    rendreProgression();
  }
  // Le résultat attendu est replié par défaut sur mobile
  $('#expected').open = !mobile.matches;
}

// --- Tiroir mobile ----------------------------------------------------------------
const ouvrirTiroir = () => document.body.classList.add('drawer-open');
function fermerTiroir() { document.body.classList.remove('drawer-open'); }

// --- Événements -----------------------------------------------------------------
function brancher() {
  $('#run-btn').addEventListener('click', executer);
  $('#clear-btn').addEventListener('click', () => { editeur.remplacer(''); reinitialiserResultat(); });
  $('#prev-level').addEventListener('click', () => allerAuNiveau(etat.niveau - 1));
  $('#next-level').addEventListener('click', () => allerAuNiveau(etat.niveau + 1));

  document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
    if (etat.mode === b.dataset.mode) return;
    etat.mode = b.dataset.mode;
    store.set('mode', etat.mode);
    afficherVue();
  }));

  const changerSgbd = (sgbd) => {
    if (etat.sgbd === sgbd) return;
    etat.sgbd = sgbd;
    store.set('sgbd', sgbd);
    appliquerSgbd();
    reinitialiserResultat();
    chargerSchema();
    if (etat.mode === 'jeu') chargerAttendu();
  };
  document.querySelectorAll('[data-sgbd]').forEach((b) => b.addEventListener('click', () => changerSgbd(b.dataset.sgbd)));
  $('#sgbd-select').addEventListener('change', (e) => changerSgbd(e.target.value));

  const changerTheme = (t) => { store.set('theme', t); appliquerTheme(t); };
  $('#theme-btn').addEventListener('click', () =>
    changerTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  document.querySelectorAll('[data-theme-choice]').forEach((b) =>
    b.addEventListener('click', () => changerTheme(b.dataset.themeChoice)));

  $('#base-select').addEventListener('change', (e) => choisirBase(e.target.value));
  $('#menu-btn').addEventListener('click', ouvrirTiroir);
  $('#base-button').addEventListener('click', ouvrirTiroir);
  $('#drawer-close').addEventListener('click', fermerTiroir);
  $('#backdrop').addEventListener('click', fermerTiroir);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermerTiroir(); });

  $('#history-clear').addEventListener('click', (e) => {
    e.preventDefault();
    store.setBase(etat.base.id, 'historique', []);
    rendreHistorique();
  });
  // Sur desktop, les panneaux latéraux restent toujours ouverts
  document.querySelectorAll('.side-panel > summary').forEach((s) => s.addEventListener('click', (e) => {
    if (!mobile.matches) e.preventDefault();
  }));
  mobile.addEventListener('change', () => {
    if (!mobile.matches) {
      fermerTiroir();
      document.querySelectorAll('.side-panel').forEach((d) => { d.open = true; });
    }
  });
}

// --- Démarrage -------------------------------------------------------------------
async function demarrer() {
  appliquerTheme(document.documentElement.dataset.theme);
  appliquerSgbd();
  appliquerMode();
  brancher();
  try {
    etat.bases = await api('/api/bases');
    $('#base-select').replaceChildren(...etat.bases.map((b) => el('option', { value: b.id, text: b.nom })));
    await choisirBase(store.get('base', etat.bases[0]?.id));
  } catch (e) {
    afficherErreur({ message: `Impossible de joindre le serveur : ${e.message}` });
  }
}

demarrer();
