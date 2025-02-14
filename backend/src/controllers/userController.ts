import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { createSuccessResponse } from "../utils/paletteResponseFactories.js";
import { Settings } from "palette-types";
import { SettingsAPI } from "../settings.js";

/**
 * Handles the GET request to retrieve a user's settings.
 *
 * @param {Request} req - The Express request object (not used in this handler).
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
export const getUserSettings = asyncHandler((req: Request, res: Response) => {
  // Get the settings object
  const settings: Settings = SettingsAPI.getUserSettings();

  // Send the settings object as a response
  res.json(createSuccessResponse(settings));
});

export const updateUserSettings = asyncHandler(
  (req: Request, res: Response) => {
    // Update the settings with the new values
    SettingsAPI.updateUserSettings(req.body as Settings);

    // Safely retrieve the updated settings
    const updatedSettings = SettingsAPI.getUserSettings();

    res.json(
      createSuccessResponse(updatedSettings, "Settings updated successfully"),
    );
  },
);
