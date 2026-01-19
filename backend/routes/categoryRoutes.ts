import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createCategory,
  getCategoriesByUserId,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";

const router = Router();

// Get all categories for the logged-in user
router.get("/", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const categories = await getCategoriesByUserId(userId);
    res.send({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send({ error: "Failed to fetch categories" });
  }
});

// Get a single category by ID
router.get("/:id", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const categoryId = parseInt(req.params.id);
    const category = await getCategoryById(categoryId, userId);

    if (!category) {
      return res.status(404).send({ error: "Category not found" });
    }

    res.send({ category });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).send({ error: "Failed to fetch category" });
  }
});

// Create a new category
router.post("/", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name) {
      return res.status(400).send({ error: "Category name is required" });
    }

    const category = await createCategory(name, userId);
    res.status(201).send({ category });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).send({ error: "Failed to create category" });
  }
});

// Update a category
router.put("/:id", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const categoryId = parseInt(req.params.id);
    const { name } = req.body;

    if (!name) {
      return res.status(400).send({ error: "Category name is required" });
    }

    const category = await updateCategory(categoryId, userId, name);

    if (!category) {
      return res.status(404).send({ error: "Category not found" });
    }

    res.send({ category });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).send({ error: "Failed to update category" });
  }
});

// Delete a category
router.delete("/:id", authMiddleware, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const categoryId = parseInt(req.params.id);
    const deleted = await deleteCategory(categoryId, userId);

    if (!deleted) {
      return res.status(404).send({ error: "Category not found" });
    }

    res.send({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).send({ error: "Failed to delete category" });
  }
});

export default router;