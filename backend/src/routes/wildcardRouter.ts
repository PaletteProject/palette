import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import path from "path";
import asyncHandler from "express-async-handler";
import { __dirname } from "../app.js";

/**
 * @swagger
 * /{any}:
 *   get:
 *     summary: Handle unknown API routes
 *     description: This route handles requests that do not match any defined API routes.
 *     responses:
 *       404:
 *         description: API route not found.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
export const wildcardRouter = asyncHandler((req: Request, res: Response) => {
  if (req.originalUrl.startsWith("/api")) {
    res.status(StatusCodes.NOT_FOUND).send({ error: "API route not found" });
  } else {
    // If the client tries to navigate to an unknown page, send them the index.html file
    res.sendFile(path.join(__dirname, "/../frontend/dist", "index.html"));
  }
});
