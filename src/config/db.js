const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('connect', () => {
  console.log('Onnistunut yhteys PostgreSQL-tietokantaan');
});

pool.on('error', (err) => {
  console.error('Virhe yhdistettäessä tietokantaan:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
