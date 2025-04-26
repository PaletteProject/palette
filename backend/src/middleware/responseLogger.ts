import { NextFunction, Request, Response } from "express";
import util from "util";

/**
 * Middleware to log the outgoing response.
 *
 * This middleware intercepts the response before it is sent to the client,
 * logs the status code and the response body, and then proceeds to send the response.
 *
 * @param {Request} _req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 */
export const responseLogger = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Store the original `send` method
  const originalSend = res.send.bind(res);

  // Override the `send` method
  res.send = function (body: unknown) {
    console.log(`\nTo Palette --> Response Status: ${res.statusCode}`);

    if (typeof body === "string") {
      try {
        const parsedBody = JSON.parse(body);
        if (parsedBody.data?.token) {
          // Create a copy of the body with obfuscated token
          const obfuscatedBody = {
            ...parsedBody,
            data: {
              ...parsedBody.data,
              token: "*****OBFUSCATED*****",
            },
          };
          console.log(
            `To Palette --> Response Body: ${util.inspect(obfuscatedBody, {
              depth: 10,
              colors: true,
            })}`
          );
        } else {
          console.log(
            `To Palette --> Response Body: ${util.inspect(parsedBody, {
              depth: 10,
              colors: true,
            })}`
          );
        }
      } catch (e) {
        // If body is not JSON, log it as is
        console.log(`To Palette --> Response Body: ${body}`);
      }
    } else if (body) {
      console.log(
        `To Palette --> Response Body: ${util.inspect(body, {
          depth: 10,
          colors: true,
        })}`
      );
    }

    // Call the original `send` method with the body
    return originalSend(body);
  };

  next(); // Continue to the next middleware or route handler
};
