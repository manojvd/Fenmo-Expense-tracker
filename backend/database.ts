import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "root",
};

const dbName = process.env.DB_NAME || "expense_tracker_doctorclub";

// Create connection pool (will be initialized after database is created)
let pool: mysql.Pool;

export async function initializeDatabase(): Promise<void> {
  try {
    // First, connect without specifying a database to create it if not exists
    const connection = await mysql.createConnection(dbConfig);

    // Create database if not exists
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\``
    );
    console.log(`Database '${dbName}' created or already exists`);

    await connection.end();

    // Now create a connection pool with the database
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Create tables
    await createUsersTable();
    await createCategoriesTable();
    await createExpensesTable();

    console.log("Database initialization complete");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

async function createUsersTable(): Promise<void> {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.execute(createTableQuery);
    console.log("Users table created or already exists");
  } catch (error) {
    console.error("Error creating users table:", error);
    throw error;
  }
}

async function createCategoriesTable(): Promise<void> {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  try {
    await pool.execute(createTableQuery);
    console.log("Categories table created or already exists");
  } catch (error) {
    console.error("Error creating categories table:", error);
    throw error;
  }
}

async function createExpensesTable(): Promise<void> {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS expenses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      amount DECIMAL(10, 2) NOT NULL,
      category_id INT NOT NULL,
      description VARCHAR(500),
      date DATE NOT NULL,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  try {
    await pool.execute(createTableQuery);
    console.log("Expenses table created or already exists");
  } catch (error) {
    console.error("Error creating expenses table:", error);
    throw error;
  }
}

export function getPool(): mysql.Pool {
  if (!pool) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return pool;
}

