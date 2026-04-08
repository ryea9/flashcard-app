require('dotenv').config();
const mysql = require('mysql2/promise');

const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'flashcard_db';

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  return pool;
}

async function initialiseDatabase() {
  const bootstrapConnection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD
  });

  try {
    await bootstrapConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  } finally {
    await bootstrapConnection.end();
  }

  const database = getPool();

  await database.query(`
    CREATE TABLE IF NOT EXISTS flashcard_set (
      id INT PRIMARY KEY,
      title VARCHAR(100) NOT NULL DEFAULT '',
      description VARCHAR(300) NOT NULL DEFAULT ''
    )
  `);

  await database.query(`
    CREATE TABLE IF NOT EXISTS flashcards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question VARCHAR(200) NOT NULL,
      answer VARCHAR(500) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await database.query(
    `INSERT INTO flashcard_set (id, title, description)
     VALUES (1, '', '')
     ON DUPLICATE KEY UPDATE id = id`
  );
}

async function query(sql, values = []) {
  const [rows] = await getPool().execute(sql, values);
  return rows;
}

async function execute(sql, values = []) {
  return getPool().execute(sql, values);
}

module.exports = {
  execute,
  initialiseDatabase,
  query
};
