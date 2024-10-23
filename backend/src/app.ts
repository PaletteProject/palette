// main entry point for backend application
import express, { Request, Response } from "express";
import rubricRouter from "./routes/rubricRouter.js"; // !! required js extension !!
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.SERVER_PORT || 3000; // use environment variable, falls back to 3000

// CORS config
const whiteListOrigins = ["http://localhost:3000"];
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions)); // enable CORS with above configuration
app.use(express.json()); // middleware to parse json requests
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

// logging middleware function
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Health check route
app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "UP" });
});

// API routes
app.use("/api/rubrics", rubricRouter);

// Wildcard route should only handle frontend routes
// It should not handle any routes under /api or other server-side routes.
app.get("*", (req: Request, res: Response) => {
  if (req.originalUrl.startsWith("/api")) {
    res.status(404).send({ error: "API route not found" });
  } else {
    // send the index.html file for other routes
    res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
  }
});

// Start the server and listen on port defined in .env file
app.listen(PORT, () => {
  console.log(`Server is up on port: ${PORT}`);
});
