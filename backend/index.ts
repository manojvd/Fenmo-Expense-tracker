import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./database";
import authRoutes from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import { authMiddleware } from "./middleware/auth.middleware";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: "*",
  methods: "*",
  allowedHeaders: "*",
}));
app.use(express.json());


// Routes
app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/expenses", expenseRoutes);

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
