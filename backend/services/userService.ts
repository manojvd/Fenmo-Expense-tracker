import bcrypt from "bcrypt";
import { getPool } from "../database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<number> {
  const pool = getPool();
  const hashedPassword = await hashPassword(password);

  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPassword]
  );

  return result.insertId;
}

export async function getUserByEmail(
  email: string
): Promise<User | null> {
  const pool = getPool();

  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0] as User;
}

export async function getUserByName(
  name: string
): Promise<User | null> {
  const pool = getPool();

  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM users WHERE name = ?",
    [name]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0] as User;
}

export async function getUserById(userId: number): Promise<User | null> {
  const pool = getPool();

  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM users WHERE id = ?",
    [userId]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0] as User;
}
