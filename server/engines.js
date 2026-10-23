// Exécution des requêtes des joueurs, avec l'utilisateur en lecture seule.
// Les deux moteurs renvoient le même format : { columns, rows, duration, truncated }.
import mysql from 'mysql2/promise';
import pg from 'pg';
import config from './config.js';

// Les nombres peuvent arriver en texte (BIGINT/NUMERIC côté pg, DECIMAL côté mysql2) :
// validate.js s'occupe de la normalisation.
// Les DATE restent en texte 'AAAA-MM-JJ' comme avec mysql2 (dateStrings), sans décalage de fuseau.
pg.types.setTypeParser(pg.types.builtins.DATE, (v) => v);

const mysqlPools = new Map();
const pgPools = new Map();

function mysqlPool(base) {
  if (!mysqlPools.has(base)) {
    const pool = mysql.createPool({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.reader.user,
      password: config.reader.password,
      database: base,
      connectionLimit: 5,
      multipleStatements: false,
      dateStrings: true,
      supportBigNumbers: true,
    });
    pool.on('connection', (conn) => {
      conn.query(`SET SESSION max_execution_time = ${config.timeoutMs}`);
    });
    mysqlPools.set(base, pool);
  }
  return mysqlPools.get(base);
}

function pgPool(base) {
  if (!pgPools.has(base)) {
    pgPools.set(base, new pg.Pool({
      host: config.postgres.host,
      port: config.postgres.port,
      user: config.reader.user,
      password: config.reader.password,
      database: base,
      max: 5,
      statement_timeout: config.timeoutMs,
      options: '-c default_transaction_read_only=on',
    }));
  }
  return pgPools.get(base);
}

async function runMysql(base, sql) {
  const [rows, fields] = await mysqlPool(base).query({ sql, rowsAsArray: true });
  if (!Array.isArray(fields)) {
    // Instruction sans résultat (ex. SET) : on renvoie un tableau vide
    return { columns: [], rows: [] };
  }
  return { columns: fields.map((f) => f.name), rows };
}

async function runPostgres(base, sql) {
  // queryMode "extended" : une seule instruction autorisée par requête
  const res = await pgPool(base).query({ text: sql, rowMode: 'array', queryMode: 'extended' });
  return { columns: (res.fields ?? []).map((f) => f.name), rows: res.rows ?? [] };
}

export const SGBD = ['mysql', 'postgres'];

export async function execute(sgbd, base, sql) {
  const texte = String(sql ?? '').trim().replace(/;\s*$/, '');
  if (!texte) throw new Error('La requête est vide.');
  const debut = performance.now();
  const resultat = sgbd === 'postgres' ? await runPostgres(base, texte) : await runMysql(base, texte);
  const duration = Math.round(performance.now() - debut);
  const truncated = resultat.rows.length > config.maxRows;
  return {
    columns: resultat.columns,
    rows: truncated ? resultat.rows.slice(0, config.maxRows) : resultat.rows,
    total: resultat.rows.length,
    truncated,
    duration,
  };
}

// Message d'erreur lisible, au format natif de chaque moteur
export function formatError(sgbd, err) {
  if (sgbd === 'postgres') {
    const pos = err.position ? ` (position ${err.position})` : '';
    return { message: `ERROR: ${err.message}${pos}`, code: err.code ?? null };
  }
  if (err.errno) {
    return { message: `ERROR ${err.errno} (${err.sqlState}): ${err.sqlMessage ?? err.message}`, code: err.code ?? null };
  }
  return { message: err.message, code: null };
}

export async function closeAll() {
  await Promise.all([...mysqlPools.values(), ...pgPools.values()].map((p) => p.end()));
}
