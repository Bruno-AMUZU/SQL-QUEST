// Crée (ou recrée) chaque base dans MySQL et PostgreSQL à partir de data/,
// ainsi que l'utilisateur en lecture seule utilisé par le jeu.
import mysql from 'mysql2/promise';
import pg from 'pg';
import config from './config.js';
import bases from '../data/bases.js';

const { user: READER, password: READER_PWD } = config.reader;

function ddl(table, quote) {
  const pk = table.colonnes.filter((c) => c.pk).map((c) => quote(c.nom));
  const lignes = table.colonnes.map((c) =>
    `  ${quote(c.nom)} ${c.type}${c.pk || !c.nullable ? ' NOT NULL' : ''}`);
  lignes.push(`  PRIMARY KEY (${pk.join(', ')})`);
  return `CREATE TABLE ${quote(table.nom)} (\n${lignes.join(',\n')}\n)`;
}

function foreignKeys(base, quote) {
  const pkDe = (nom) => base.tables.find((t) => t.nom === nom).colonnes.find((c) => c.pk).nom;
  return base.tables.flatMap((t) => t.colonnes.filter((c) => c.ref).map((c) =>
    `ALTER TABLE ${quote(t.nom)} ADD CONSTRAINT ${quote(`fk_${t.nom}_${c.nom}`)} ` +
    `FOREIGN KEY (${quote(c.nom)}) REFERENCES ${quote(c.ref)} (${quote(pkDe(c.ref))})`));
}

async function seedMysql(base) {
  const q = (n) => `\`${n}\``;
  const conn = await mysql.createConnection({
    host: config.mysql.host,
    port: config.mysql.port,
    user: 'root',
    password: config.mysql.rootPassword,
  });
  try {
    await conn.query(`DROP DATABASE IF EXISTS ${q(base.id)}`);
    await conn.query(`CREATE DATABASE ${q(base.id)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE ${q(base.id)}`);
    for (const t of base.tables) {
      await conn.query(ddl(t, q));
      const lignes = base.donnees[t.nom];
      if (lignes.length) {
        await conn.query(`INSERT INTO ${q(t.nom)} VALUES ?`, [lignes]);
      }
    }
    for (const fk of foreignKeys(base, q)) await conn.query(fk);
    await conn.query(`CREATE USER IF NOT EXISTS '${READER}'@'%' IDENTIFIED BY ?`, [READER_PWD]);
    await conn.query(`ALTER USER '${READER}'@'%' IDENTIFIED BY ?`, [READER_PWD]);
    await conn.query(`GRANT SELECT ON ${q(base.id)}.* TO '${READER}'@'%'`);
    await conn.query('FLUSH PRIVILEGES');
  } finally {
    await conn.end();
  }
}

async function seedPostgres(base) {
  const q = (n) => `"${n}"`;
  const admin = {
    host: config.postgres.host,
    port: config.postgres.port,
    user: config.postgres.adminUser,
    password: config.postgres.adminPassword,
  };
  const root = new pg.Client({ ...admin, database: 'postgres' });
  await root.connect();
  try {
    const role = await root.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [READER]);
    const pwd = READER_PWD.replace(/'/g, "''");
    await root.query(role.rowCount
      ? `ALTER ROLE ${q(READER)} WITH LOGIN PASSWORD '${pwd}'`
      : `CREATE ROLE ${q(READER)} WITH LOGIN PASSWORD '${pwd}'`);
    await root.query(`ALTER ROLE ${q(READER)} SET default_transaction_read_only = on`);
    await root.query(`ALTER ROLE ${q(READER)} SET statement_timeout = '${config.timeoutMs}ms'`);
    await root.query(`DROP DATABASE IF EXISTS ${q(base.id)} WITH (FORCE)`);
    await root.query(`CREATE DATABASE ${q(base.id)} ENCODING 'UTF8' TEMPLATE template0`);
  } finally {
    await root.end();
  }

  const db = new pg.Client({ ...admin, database: base.id });
  await db.connect();
  try {
    for (const t of base.tables) {
      await db.query(ddl(t, q));
      const lignes = base.donnees[t.nom];
      if (!lignes.length) continue;
      const n = t.colonnes.length;
      const placeholders = lignes.map((_, i) =>
        `(${t.colonnes.map((__, j) => `$${i * n + j + 1}`).join(', ')})`);
      await db.query(`INSERT INTO ${q(t.nom)} VALUES ${placeholders.join(', ')}`, lignes.flat());
    }
    for (const fk of foreignKeys(base, q)) await db.query(fk);
    await db.query(`REVOKE ALL ON SCHEMA public FROM PUBLIC`);
    await db.query(`GRANT CONNECT ON DATABASE ${q(base.id)} TO ${q(READER)}`);
    await db.query(`GRANT USAGE ON SCHEMA public TO ${q(READER)}`);
    await db.query(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO ${q(READER)}`);
  } finally {
    await db.end();
  }
}

for (const base of bases) {
  process.stdout.write(`• ${base.nom} (${base.id}) → MySQL… `);
  await seedMysql(base);
  process.stdout.write('ok, PostgreSQL… ');
  await seedPostgres(base);
  console.log('ok');
  for (const t of base.tables) console.log(`    ${t.nom.padEnd(10)} ${base.donnees[t.nom].length} lignes`);
}
console.log('Bases prêtes.');
