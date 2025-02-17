import express from "express";

import {
  getAllTemplates,
  addTemplate,
  updateTemplate,
  getTemplateByKey,
  getTemplateByTitle,
  deleteTemplateByTitle,
  addTemplates,
  deleteTemplates,
  updateTemplates,
  deleteTemplate,
} from "../controllers/templateController.js";

const router = express.Router();

// router.get("/", getAllTemplates);

/**
 * @swagger
 * /templates:
 *   get:
 *     summary: Get all templates
 *     description: Retrieve a list of all templates.
 *     responses:
 *       200:
 *         description: List of templates.
 */
router.get("/", getAllTemplates);

/**
 * @swagger
 * /templates/byTitle/{title}:
 *   get:
 *     summary: Get a template by title
 *     description: Retrieve a specific template using its title.
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: The title of the template.
 *     responses:
 *       200:
 *         description: A single template.
 *       404:
 *         description: Template not found.
 */
router.get("/byTitle/:title", getTemplateByTitle);

/**
 * @swagger
 * /templates/byKey/{key}:
 *   get:
 *     summary: Get a template by key
 *     description: Retrieve a template using its unique key.
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique key of the template.
 *     responses:
 *       200:
 *         description: A template object.
 *       404:
 *         description: Template not found.
 */

router.get("/byKey/:key", getTemplateByKey);

/**
 * @swagger
 * /templates:
 *   post:
 *     summary: Add a new template
 *     description: Create a new template in the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Template created.
 *       400:
 *         description: Invalid input.
 */
router.post("/", addTemplate);

/**
 * @swagger
 * /templates/bulk:
 *   post:
 *     summary: Add multiple templates
 *     description: Create multiple templates in the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Template created.
 *       400:
 *         description: Invalid input.
 */
router.post("/bulk", addTemplates);

/**
 * @swagger
 * /templates:
 *   put:
 *     summary: Update an existing template
 *     description: Modify an existing template.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               updates:
 *                 type: object
 *     responses:
 *       200:
 *         description: Template updated.
 *       400:
 *         description: Invalid input.
 */
router.put("/", updateTemplate);

/**
 * @swagger
 * /templates/byTitle/{title}:
 *   delete:
 *     summary: Delete a template by title
 *     description: Remove a template using its title.
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template deleted.
 *       404:
 *         description: Template not found.
 */
router.delete("/byTitle/:title", deleteTemplateByTitle);

/**
 * @swagger
 * /templates/byKey/{key}:
 *   delete:
 *     summary: Delete a template by key
 *     description: Remove a template using its key.
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template deleted.
 *       404:
 *         description: Template not found.
 */
router.delete("/", deleteTemplate);

/**
 * @swagger
 * /templates/bulk:
 *   delete:
 *     summary: Delete multiple templates
 *     description: Remove multiple templates using their keys.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               keys:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Templates deleted.
 *       404:
 *         description: Template not found.
 */
router.delete("/bulk", deleteTemplates);

/**
 * @swagger
 * /templates/bulk:
 *   put:
 *     summary: Update multiple templates
 *     description: Update multiple templates in the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templates:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Templates updated.
 *       400:
 *         description: Invalid input.
 */
router.put("/bulk", updateTemplates);
export default router;
