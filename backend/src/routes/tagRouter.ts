import express from "express";

import {
  getAllTags,
  addTag,
  updateTag,
  getTagByKey,
  deleteTagByKey,
  addTags,
  deleteTags,
} from "../controllers/tagController.js";

const router = express.Router();

// router.get("/", getAllTemplates);

/**


 * @swagger
 * /tags:
 *   get:
 *     summary: Get all tags
 *     description: Retrieve a list of all tags.
 *     responses:
 *       200:
 *         description: List of tags.
 */

router.get("/", getAllTags);

/**
 * @swagger
 * /tags/byKey/{key}:
 *   get:
 *     summary: Get a tag by key
 *     description: Retrieve a tag using its unique key.
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string

 *         description: The unique key of the tag.
 *     responses:
 *       200:
 *         description: A tag object.
 *       404:
 *         description: Tag not found.
 */

router.get("/byKey/:key", getTagByKey);

/**
 * @swagger

 * /tags:
 *   post:
 *     summary: Add a new tag
 *     description: Create a new tag in the system.
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
 *         description: Tag created.
 *       400:
 *         description: Invalid input.
 */

router.post("/", addTag);

/**
 * @swagger

 * /tags:
 *   post:
 *     summary: Add a new tag
 *     description: Create a new tag in the system.
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
 *         description: Tag created.
 *       400:
 *         description: Invalid input.
 */

router.post("/bulk", addTags);

/**
 * @swagger

 * /tags:
 *   put:
 *     summary: Update an existing tag
 *     description: Modify an existing tag.
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
 *         description: Tag updated.
 *       400:
 *         description: Invalid input.
 */
router.put("/", updateTag);

/**
 * @swagger
 * /tags/byKey/{key}:
 *   delete:
 *     summary: Delete a tag by key
 *     description: Remove a tag using its key.
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string

 *     responses:
 *       200:
 *         description: Tag deleted.
 *       404:
 *         description: Tag not found.
 */

router.delete("/byKey/:key", deleteTagByKey);

/**
 * @swagger
 * /tags/byKey/{key}:
 *   delete:
 *     summary: Delete a tag by key
 *     description: Remove a tag using its key.
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string

 *     responses:
 *       200:
 *         description: Tag deleted.
 *       404:
 *         description: Tag not found.
 */

router.delete("/bulk", deleteTags);
export default router;
