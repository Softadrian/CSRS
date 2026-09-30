const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then((connection) => {
    console.log('Onnistunut yhteys MySQL-tietokantaan');
    connection.release();
  })
  .catch((err) => {
    console.error('Virhe yhdistettäessä MySQL-tietokantaan:', err.message);
  });

module.exports = pool;