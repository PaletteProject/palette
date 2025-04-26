import { Request, Response, NextFunction } from "express";
import util from "util";

/**
 * Middleware to log the incoming request.
 *
 * This middleware logs the HTTP method, URL, headers, and body of the incoming request.
 * It is useful for debugging and monitoring purposes.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} _res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 */
export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  console.log(
    `\nRequest [${req.hostname} on ${req.ip}]: ${req.method} ${req.url}(requestLogger)`
  );
  console.log(`Body: ${util.inspect(req.body, { depth: 10, colors: true })}`);
  next();
};
