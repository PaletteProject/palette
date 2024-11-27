import express from "express";

import {
  getAllTemplates,
  addTemplate,
  updateTemplate,
  getTemplateByKey,
  getTemplateByTitle,
  deleteTemplateByTitle,
  deleteTemplateByKey,
} from "../controllers/templateController.js";

const router = express.Router();

// router.get("/", getAllTemplates);
router.get("/", getAllTemplates);
router.get("/byTitle/:title", getTemplateByTitle);
router.get("/byKey/:key", getTemplateByKey);
router.post("/", addTemplate);
router.put("/", updateTemplate);
router.delete("/byTitle/:title", deleteTemplateByTitle);
router.delete("/byKey/:key", deleteTemplateByKey);
export default router;
