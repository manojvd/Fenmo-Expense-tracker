import { getPool } from "../database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface Expense {
  id: number;
  amount: number;
  category_id: number;
  description: string | null;
  date: Date;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

interface ExpenseFilters {
  categoryId?: number;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
}

export async function createExpense(
  amount: number,
  categoryId: number,
  description: string | null,
  date: string,
  userId: number
): Promise<Expense> {
  const pool = getPool();

  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO expenses (amount, category_id, description, date, user_id) VALUES (?, ?, ?, ?, ?)",
    [amount, categoryId, description, date, userId]
  );

  return {
    id: result.insertId,
    amount,
    category_id: categoryId,
    description,
    date: new Date(date),
    user_id: userId,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

export async function getExpensesByUserId(
  userId: number,
  filters: ExpenseFilters = {}
): Promise<Expense[]> {
  const pool = getPool();

  let query = "SELECT * FROM expenses WHERE user_id = ?";
  const params: (number | string)[] = [userId];

  // Filter by category
  if (filters.categoryId) {
    query += " AND category_id = ?";
    params.push(filters.categoryId);
  }

  // Sort by date or amount
  const sortBy = filters.sortBy || "date";
  const sortOrder = filters.sortOrder || "desc";
  query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

  const [rows] = await pool.execute<RowDataPacket[]>(query, params);

  return rows as Expense[];
}

export async function getExpenseById(
  expenseId: number,
  userId: number
): Promise<Expense | null> {
  const pool = getPool();

  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM expenses WHERE id = ? AND user_id = ?",
    [expenseId, userId]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0] as Expense;
}

export async function updateExpense(
  expenseId: number,
  userId: number,
  data: {
    amount?: number;
    categoryId?: number;
    description?: string | null;
    date?: string;
  }
): Promise<Expense | null> {
  const pool = getPool();

  const updates: string[] = [];
  const params: (number | string | null)[] = [];

  if (data.amount !== undefined) {
    updates.push("amount = ?");
    params.push(data.amount);
  }
  if (data.categoryId !== undefined) {
    updates.push("category_id = ?");
    params.push(data.categoryId);
  }
  if (data.description !== undefined) {
    updates.push("description = ?");
    params.push(data.description);
  }
  if (data.date !== undefined) {
    updates.push("date = ?");
    params.push(data.date);
  }

  if (updates.length === 0) {
    return getExpenseById(expenseId, userId);
  }

  params.push(expenseId, userId);

  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE expenses SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`,
    params
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getExpenseById(expenseId, userId);
}

export async function deleteExpense(
  expenseId: number,
  userId: number
): Promise<boolean> {
  const pool = getPool();

  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM expenses WHERE id = ? AND user_id = ?",
    [expenseId, userId]
  );

  return result.affectedRows > 0;
}

