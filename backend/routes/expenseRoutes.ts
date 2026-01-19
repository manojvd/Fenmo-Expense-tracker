import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createExpense,
  getExpensesByUserId,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../services/expenseService";

const router = Router();

// Get all expenses with optional filtering
// Query params: categoryId, sortBy (date|amount), sortOrder (asc|desc)
router.get("/", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { categoryId, sortBy, sortOrder } = req.query;

    const filters = {
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      sortBy: sortBy as "date" | "amount" | undefined,
      sortOrder: sortOrder as "asc" | "desc" | undefined,
    };

    const expenses = await getExpensesByUserId(userId, filters);
    res.send({ expenses });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).send({ error: "Failed to fetch expenses" });
  }
});

// Get a single expense by ID
router.get("/:id", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const expenseId = parseInt(req.params.id);
    const expense = await getExpenseById(expenseId, userId);

    if (!expense) {
      return res.status(404).send({ error: "Expense not found" });
    }

    res.send({ expense });
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).send({ error: "Failed to fetch expense" });
  }
});

// Create a new expense
router.post("/", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { amount, categoryId, description, date } = req.body;

    if (!amount || !categoryId || !date) {
      return res.status(400).send({
        error: "Amount, categoryId, and date are required",
      });
    }

    const expense = await createExpense(
      amount,
      categoryId,
      description || null,
      date,
      userId
    );
    res.status(201).send({ expense });
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).send({ error: "Failed to create expense" });
  }
});

// Update an expense
router.put("/:id", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const expenseId = parseInt(req.params.id);
    const { amount, categoryId, description, date } = req.body;

    const expense = await updateExpense(expenseId, userId, {
      amount,
      categoryId,
      description,
      date,
    });

    if (!expense) {
      return res.status(404).send({ error: "Expense not found" });
    }

    res.send({ expense });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).send({ error: "Failed to update expense" });
  }
});

// Delete an expense
router.delete("/:id", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const expenseId = parseInt(req.params.id);
    const deleted = await deleteExpense(expenseId, userId);

    if (!deleted) {
      return res.status(404).send({ error: "Expense not found" });
    }

    res.send({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).send({ error: "Failed to delete expense" });
  }
});

export default router;

