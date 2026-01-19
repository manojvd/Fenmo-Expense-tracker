import { getPool } from "../database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface Category {
  id: number;
  name: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export async function createCategory(
  name: string,
  userId: number
): Promise<Category> {
  const pool = getPool();

  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO categories (name, user_id) VALUES (?, ?)",
    [name, userId]
  );

  return {
    id: result.insertId,
    name,
    user_id: userId,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

export async function getCategoriesByUserId(
  userId: number
): Promise<Category[]> {
  const pool = getPool();

  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM categories WHERE user_id = ?",
    [userId]
  );

  return rows as Category[];
}

export async function getCategoryById(
  categoryId: number,
  userId: number
): Promise<Category | null> {
  const pool = getPool();

  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM categories WHERE id = ? AND user_id = ?",
    [categoryId, userId]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0] as Category;
}

export async function updateCategory(
  categoryId: number,
  userId: number,
  name: string
): Promise<Category | null> {
  const pool = getPool();

  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE categories SET name = ? WHERE id = ? AND user_id = ?",
    [name, categoryId, userId]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getCategoryById(categoryId, userId);
}

export async function deleteCategory(
  categoryId: number,
  userId: number
): Promise<boolean> {
  const pool = getPool();

  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM categories WHERE id = ? AND user_id = ?",
    [categoryId, userId]
  );

  return result.affectedRows > 0;
}

