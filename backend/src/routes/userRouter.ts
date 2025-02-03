import express from "express";
import {
  getUserSettings,
  updateUserSettings,
} from "../controllers/userController.js";
import { validationErrorHandler } from "../middleware/validationErrorHandler.js";
import { updateUserSettingsValidator } from "../validators/updateUserSettingsValidator.js";

const userRouter = express.Router();

/**
 * @swagger
 * /user/settings:
 *   get:
 *     summary: Get user settings
 *     description: Retrieve the settings for the currently authenticated user.
 *     responses:
 *       200:
 *         description: Successfully retrieved user settings.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 darkMode:
 *                   type: boolean
 *                   example: true
 *                 notifications:
 *                   type: boolean
 *                   example: false
 *       401:
 *         description: Get the settings for the current user.
 * @route GET /user/settings
 * @description Get the settings for the current user.
 */
userRouter.get("/settings", getUserSettings);

/**
 * @swagger
 * /user/settings:
 *   put:
 *     summary: Update user settings
 *     description: Modify the settings for the current user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               darkMode:
 *                 type: boolean
 *                 description: Enable or disable dark mode.
 *                 example: true
 *               notifications:
 *                 type: boolean
 *                 description: Enable or disable notifications.
 *                 example: false
 *     responses:
 *       200:
 *         description: Settings updated successfully.
 *       400:
 *         description: Validation error in request body.
 *       401:
 *         description: Unauthorized. User authentication required.
 * @route PUT /user/settings
 */
userRouter.put(
  "/settings",
  updateUserSettingsValidator,
  validationErrorHandler,
  updateUserSettings,
);

export default userRouter;
