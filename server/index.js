import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './config.js';
import bases, { getBase } from '../data/bases.js';
import { execute, formatError, SGBD } from './engines.js';
import { valider } from './validate.js';

const racine = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '64kb' }));
app.use(express.static(path.join(racine, '..', 'public')));

// --- Helpers -----------------------------------------------------------------
function contexte(req, res) {
  const src = { ...req.query, ...req.body };
  const sgbd = SGBD.includes(src.sgbd) ? src.sgbd : 'mysql';
  const base = getBase(req.params.base ?? src.base);
  if (!base) {
    res.status(404).json({ erreur: 'Base inconnue.' });
    return null;
  }
  return { sgbd, base };
}

function niveauDe(base, n, res) {
  const niveau = base.niveaux[Number(n) - 1];
  if (!niveau) res.status(404).json({ erreur: 'Niveau inconnu.' });
  return niveau;
}

const attendus = new Map();
async function resultatAttendu(sgbd, base, index) {
  const k = `${sgbd}:${base.id}:${index}`;
  if (!attendus.has(k)) {
    attendus.set(k, execute(sgbd, base.id, base.niveaux[index].solution).catch((e) => {
      attendus.delete(k);
      throw e;
    }));
  }
  return attendus.get(k);
}

// --- Routes ------------------------------------------------------------------
app.get('/api/bases', (req, res) => {
  res.json(bases.map(({ id, nom, icone, description, exemples, niveaux }) =>
    ({ id, nom, icone, description, exemples, nbNiveaux: niveaux.length })));
});

app.get('/api/bases/:base/schema', async (req, res) => {
  const ctx = contexte(req, res);
  if (!ctx) return;
  const { sgbd, base } = ctx;
  const tables = await Promise.all(base.tables.map(async (t) => {
    let lignes = null;
    try {
      const r = await execute(sgbd, base.id, `SELECT COUNT(*) FROM ${t.nom}`);
      lignes = Number(r.rows[0][0]);
    } catch { /* base indisponible : on affiche quand même le schéma */ }
    return { ...t, lignes };
  }));
  res.json({ id: base.id, nom: base.nom, tables });
});

app.get('/api/bases/:base/niveaux', (req, res) => {
  const ctx = contexte(req, res);
  if (!ctx) return;
  // Les solutions restent côté serveur
  res.json(ctx.base.niveaux.map(({ titre, tags, enonce, indice, ordre }, i) =>
    ({ numero: i + 1, titre, tags, enonce, indice, trie: Boolean(ordre?.length) })));
});

app.get('/api/bases/:base/niveaux/:n/attendu', async (req, res) => {
  const ctx = contexte(req, res);
  if (!ctx) return;
  if (!niveauDe(ctx.base, req.params.n, res)) return;
  try {
    const r = await resultatAttendu(ctx.sgbd, ctx.base, Number(req.params.n) - 1);
    res.json({ columns: r.columns, rows: r.rows });
  } catch (e) {
    res.status(500).json({ erreur: formatError(ctx.sgbd, e).message });
  }
});

app.post('/api/query', async (req, res) => {
  const ctx = contexte(req, res);
  if (!ctx) return;
  try {
    res.json(await execute(ctx.sgbd, ctx.base.id, req.body.sql));
  } catch (e) {
    res.json({ erreur: formatError(ctx.sgbd, e) });
  }
});

app.post('/api/valider', async (req, res) => {
  const ctx = contexte(req, res);
  if (!ctx) return;
  const niveau = niveauDe(ctx.base, req.body.niveau, res);
  if (!niveau) return;
  let obtenu;
  try {
    obtenu = await execute(ctx.sgbd, ctx.base.id, req.body.sql);
  } catch (e) {
    return res.json({ ok: false, raison: 'la requête a échoué', erreur: formatError(ctx.sgbd, e) });
  }
  try {
    const attendu = await resultatAttendu(ctx.sgbd, ctx.base, Number(req.body.niveau) - 1);
    res.json({ ...valider(attendu, obtenu, niveau.ordre), resultat: obtenu });
  } catch (e) {
    res.status(500).json({ erreur: { message: `Solution indisponible : ${formatError(ctx.sgbd, e).message}` } });
  }
});

app.listen(config.port, () => {
  console.log(`SQL QUEST → http://localhost:${config.port}`);
});
