const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env')
});

console.log('DB_USER:', process.env.DB_USER);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then((connection) => {
    console.log('Onnistunut yhteys MySQL-tietokantaan');
    connection.release();
  })
  .catch((err) => {
    console.error(
      'Virhe yhdistettäessä MySQL-tietokantaan:',
      err.message
    );
  });

module.exports = pool;