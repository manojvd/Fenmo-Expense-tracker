import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./database";
import authRoutes from "./authRoutes";

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

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World - Fenmo Expense Tracker API");
});

// Auth routes
app.use("/auth", authRoutes);

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
