import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./database";
import { createUser, getUserByEmail, verifyPassword } from "./userService";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World - Fenmo Expense Tracker API");
});

// Example route to register a new user
app.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "name, email and password are required" });
      return;
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: "Email already exists" });
      return;
    }

    const userId = await createUser(name, email, password);
    res.status(201).json({ message: "User created successfully", id: userId });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Example route to login
app.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    const user = await getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    res.json({ message: "Login successful", id: user.id, name: user.name });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

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
