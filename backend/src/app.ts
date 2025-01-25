import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { StatusCodes } from "http-status-codes";
import { validationErrorHandler } from "./middleware/validationErrorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { responseLogger } from "./middleware/responseLogger.js";
import { fallbackErrorHandler } from "./middleware/fallbackErrorHandler.js";
import { wildcardRouter } from "./routes/wildcardRouter.js";
import courseRouter from "./routes/courseRouter.js";
import userRouter from "./routes/userRouter.js";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// CORS config
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions)); // enable CORS with above configuration
app.use(express.json()); // middleware to parse json requests
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Request logging
app.use(requestLogger);

// Response logging
app.use(responseLogger);

// Health check route
app.get("/health", (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({ status: "HEALTHY" });
});

// API routes
app.use("/api/courses", courseRouter);
app.use("/api/user", userRouter);
app.get("*", wildcardRouter);

// field validation error handling middleware
app.use(validationErrorHandler);

// handle all unhandled errors
app.use(fallbackErrorHandler);

// Start the server and listen on port defined in .env file
app.listen(PORT, () => {
  console.log(
    "\nPalette started!\n\nAccess the application at http://localhost:5173",
  );
});
