import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { StatusCodes } from "http-status-codes";
import { swaggerUiServe, swaggerUiSetup } from "./APIDoc/APIDocumentation.js";
import { validationErrorHandler } from "./middleware/validationErrorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { responseLogger } from "./middleware/responseLogger.js";
import { fallbackErrorHandler } from "./middleware/fallbackErrorHandler.js";
import { wildcardRouter } from "./routes/wildcardRouter.js";
import courseRouter from "./routes/courseRouter.js";
import userRouter from "./routes/userRouter.js";
import templateRouter from "./routes/templateRouter.js";
import tagRouter from "./routes/tagRouter.js";
// Get the directory name
const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// CORS config
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions)); // enable CORS with above configuration
app.use(express.json()); // middleware to parse json requests
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Add Swagger documentation route
app.use("/api-docs", swaggerUiServe, swaggerUiSetup); // Serves Swagger UI for OpenAPI documentation

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
app.use("/api/templates", templateRouter);
app.use("/api/tags", tagRouter);
app.get("*", wildcardRouter);

// field validation error handling middleware
app.use(validationErrorHandler);

// handle all unhandled errors
app.use(fallbackErrorHandler);

// Start the server and listen on port defined in .env file
app.listen(PORT, () => {
  console.log(
    "\nPalette started!\n\nAccess the application at http://localhost:5173"
  );
  console.log(
    `Swagger API documentation available at http://localhost:${PORT}/api-docs`
  );
});
