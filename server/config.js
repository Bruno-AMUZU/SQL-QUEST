import 'dotenv/config';

const env = (nom, defaut) => process.env[nom] ?? defaut;

export default {
  port: Number(env('PORT', 3000)),
  mysql: {
    host: env('MYSQL_HOST', '127.0.0.1'),
    port: Number(env('MYSQL_PORT', 3307)),
    rootPassword: env('MYSQL_ROOT_PASSWORD', 'root_sqlquest'),
  },
  postgres: {
    host: env('PG_HOST', '127.0.0.1'),
    port: Number(env('PG_PORT', 5433)),
    adminUser: env('PG_ADMIN_USER', 'postgres'),
    adminPassword: env('PG_ADMIN_PASSWORD', 'postgres_sqlquest'),
  },
  reader: {
    user: env('READER_USER', 'lecteur'),
    password: env('READER_PASSWORD', 'lecteur_sqlquest'),
  },
  // Garde-fous appliqués aux requêtes des joueurs
  timeoutMs: 3000,
  maxRows: 1000,
};
