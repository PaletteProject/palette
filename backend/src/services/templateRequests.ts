import { Template, PaletteAPIResponse } from "palette-types";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { createTemplate } from "../../../frontend/src/utils/templateFactory.js";
import fs from "fs";

const templatesPath = "./templates.json";
let templates: Template[] | null = null;
export const defaultTemplates: Template[] = [];

export const TemplateService = {
  // POST REQUESTS (Templates Setter/Page Functions)

  initializeTemplates: () => {
    if (!fs.existsSync(templatesPath)) {
      fs.writeFileSync(
        templatesPath,
        JSON.stringify(defaultTemplates, null, 2),
      );
      templates = defaultTemplates;
    } else {
      templates = JSON.parse(
        fs.readFileSync(templatesPath, "utf-8"),
      ) as Template[];
    }
  },

  addTemplate: asyncHandler(async (req: Request, res: Response) => {
    if (templates === null) {
      TemplateService.initializeTemplates();
    }
    console.log("template data", req.body);
    const templatesData = fs.readFileSync(templatesPath, "utf8");
    const localTemplates = JSON.parse(templatesData) as Template[];
    const template = createTemplate();
    const templateData = (await req.body) as Template | null;
    if (templateData) {
      const templateIndex = localTemplates.findIndex(
        (tmplt: Template) => tmplt.title === templateData.title,
      );
      template.title = templateData.title;
      template.criteria = templateData.criteria;
      template.id = templateData.id;
      template.key = templateData.key;
      template.tags = templateData.tags;
      template.points = templateData.points;
      if (templateIndex === -1) {
        // only push if the template doesn't already exist
        localTemplates.push(template);
        console.log("templates.json templates", localTemplates);
      } else {
        // update the existing template
        console.log("Template already exists!");
      }
      fs.writeFileSync(templatesPath, JSON.stringify(localTemplates, null, 2));
    }

    const apiResponse: PaletteAPIResponse<unknown> = {
      success: true,
      message: "Template created successfully!",
    };

    res.json(apiResponse);
  }),

  addTemplates: asyncHandler(async (req: Request, res: Response) => {
    if (templates === null) {
      TemplateService.initializeTemplates();
    }

    const templatesData = fs.readFileSync(templatesPath, "utf8");
    const localTemplates = JSON.parse(templatesData) as Template[];
    const templatesToAdd = (await req.body) as Template[] | null;

    if (templatesToAdd) {
      for (const templateToAdd of templatesToAdd) {
        const templateIndex = localTemplates.findIndex(
          (t: Template) => t.title === templateToAdd.title,
        );
        const template = createTemplate();
        template.title = templateToAdd.title;
        template.criteria = templateToAdd.criteria;
        template.id = templateToAdd.id;
        template.key = templateToAdd.key;
        template.tags = templateToAdd.tags;
        template.points = templateToAdd.points;

        template.lastUsed = templateToAdd.lastUsed;
        template.usageCount = templateToAdd.usageCount;

        if (templateIndex === -1) {
          localTemplates.push(template);
        } else {
          console.log("Template already exists!");
        }
      }

      fs.writeFileSync(templatesPath, JSON.stringify(localTemplates, null, 2));
    }

    const apiResponse: PaletteAPIResponse<unknown> = {
      success: true,
      message: "Templates created successfully!",
    };

    res.json(apiResponse);
  }),

  updateTemplate: asyncHandler(async (req: Request, res: Response) => {
    if (templates === null) {
      TemplateService.initializeTemplates();
    }
    console.log("updating template request", req.body);
    const templatesData = fs.readFileSync(templatesPath, "utf8");
    const localTemplates = JSON.parse(templatesData) as Template[];
    const templateData = (await req.body) as Template | null;
    if (templateData) {
      const templateIndex = localTemplates.findIndex(
        (tmplt: Template) => tmplt.key === templateData.key,
      );
      console.log("templateIndex", templateIndex);
      console.log("templateData", templateData);
      if (templateIndex !== -1) {
        localTemplates[templateIndex] = templateData;

        console.log("updated templates", localTemplates);
        console.log("templates", templates);
        fs.writeFileSync(
          templatesPath,
          JSON.stringify(localTemplates, null, 2),
        );
      }
    }

    const apiResponse: PaletteAPIResponse<unknown> = {
      success: true,
      message: "Template updated successfully!",
    };

    res.json(apiResponse);
  }),

  // DELETE REQUESTS (Templates Page Functions)
  deleteTemplateByKey: (req: Request, res: Response) => {
    console.log("deleteTemplateByKey request", req.params);
    const templatesData = fs.readFileSync(templatesPath, "utf8");
    const localTemplates = JSON.parse(templatesData) as Template[];
    const templateKey = req.params.key;
    console.log("templateKey", templateKey);
    if (templateKey) {
      const templateIndex = localTemplates.findIndex(
        (tmplt: Template) => tmplt.key === templateKey,
      );
      console.log("templateIndex", templateIndex);
      if (templateIndex !== -1) {
        localTemplates.splice(templateIndex, 1);
        fs.writeFileSync(
          templatesPath,
          JSON.stringify(localTemplates, null, 2),
        );
      }
    }

    const apiResponse: PaletteAPIResponse<unknown> = {
      success: true,
      message: "Template deleted successfully!",
    };

    res.json(apiResponse);
  },

  deleteTemplates: asyncHandler(async (req: Request, res: Response) => {
    if (templates === null) {
      TemplateService.initializeTemplates();
    }

    const templatesData = fs.readFileSync(templatesPath, "utf8");
    const localTemplates = JSON.parse(templatesData) as Template[];
    const templatesToDelete = (await req.body) as Template[] | null;

    if (templatesToDelete) {
      for (const templateToDelete of templatesToDelete) {
        const templateIndex = localTemplates.findIndex(
          (t: Template) => t.title === templateToDelete.title,
        );
        const template = createTemplate();
        template.title = templateToDelete.title;
        template.criteria = templateToDelete.criteria;
        template.id = templateToDelete.id;
        template.key = templateToDelete.key;
        template.tags = templateToDelete.tags;
        template.points = templateToDelete.points;

        template.lastUsed = templateToDelete.lastUsed;
        template.usageCount = templateToDelete.usageCount;

        if (templateIndex !== -1) {
          localTemplates.splice(templateIndex, 1);
        } else {
          console.log("Template not found!");
        }
      }

      fs.writeFileSync(templatesPath, JSON.stringify(localTemplates, null, 2));
    }

    const apiResponse: PaletteAPIResponse<unknown> = {
      success: true,
      message: "Templates deleted successfully!",
    };

    res.json(apiResponse);
  }),

  deleteAllCriteriaByTitle: asyncHandler(
    async (req: Request, res: Response) => {
      const templatesData = fs.readFileSync(templatesPath, "utf8");
      const localTemplates = JSON.parse(templatesData) as Template[];
      const templateData = (await req.body) as Template | null;
      const templateTitle = templateData?.title;
      if (templateTitle) {
        const templateIndex = localTemplates.findIndex(
          (tmplt: Template) => tmplt.title === templateTitle,
        );
        if (templateIndex !== -1) {
          localTemplates[templateIndex].criteria = [];
          fs.writeFileSync(
            templatesPath,
            JSON.stringify(localTemplates, null, 2),
          );
        }
      }

      const apiResponse: PaletteAPIResponse<unknown> = {
        success: true,
        message: "Template deleted successfully!",
      };

      res.json(apiResponse);
    },
  ),

  deleteAllCriteriaByKey: asyncHandler(async (req: Request, res: Response) => {
    const templatesData = fs.readFileSync(templatesPath, "utf8");
    const localTemplates = JSON.parse(templatesData) as Template[];
    const templateData = (await req.body) as Template | null;
    const templateKey = templateData?.key;
    if (templateKey) {
      const templateIndex = localTemplates.findIndex(
        (tmplt: Template) => tmplt.key === templateKey,
      );
      if (templateIndex !== -1) {
        localTemplates[templateIndex].criteria = [];
        fs.writeFileSync(
          templatesPath,
          JSON.stringify(localTemplates, null, 2),
        );
      }
    }

    const apiResponse: PaletteAPIResponse<unknown> = {
      success: true,
      message: "Template criteria deleted successfully!",
    };

    res.json(apiResponse);
  }),

  deleteTemplateByTitle: asyncHandler(async (req: Request, res: Response) => {
    console.log("template data", req.body);
    const templatesData = fs.readFileSync(templatesPath, "utf8");
    const localTemplates = JSON.parse(templatesData) as Template[];
    const templateData = (await req.body) as Template | null;
    const templateTitle = templateData?.title;
    if (templateTitle) {
      const templateIndex = localTemplates.findIndex(
        (tmplt: Template) => tmplt.title === templateTitle,
      );
      if (templateIndex !== -1) {
        localTemplates.splice(templateIndex, 1);
        fs.writeFileSync(
          templatesPath,
          JSON.stringify(localTemplates, null, 2),
        );
      }
    }

    const apiResponse: PaletteAPIResponse<unknown> = {
      success: true,
      message: "Template deleted successfully!",
    };

    res.json(apiResponse);
  }),

  // GET REQUESTS (Templates API Functions)

  getAllTemplates: asyncHandler(async (req: Request, res: Response) => {
    if (templates === null) {
      TemplateService.initializeTemplates();
    }
    const templatesData = fs.readFileSync(templatesPath, "utf8");
    const localTemplates = JSON.parse(templatesData) as Template[];
    const request = (await req.body) as JSON;
    if (request !== null) {
      const apiResponse: PaletteAPIResponse<Template[]> = {
        success: true,
        message: "Templates fetched successfully!",
        data: localTemplates,
      };
      res.json(apiResponse);
    }
  }),

  getTemplateByKey: asyncHandler(async (req: Request, res: Response) => {
    if (templates === null) {
      TemplateService.initializeTemplates();
    }
    const templatesData = fs.readFileSync(templatesPath, "utf8");
    const localTemplates = JSON.parse(templatesData) as Template[];
    const templateData = (await req.body) as Template | null;
    const templateKey = templateData?.key;
    if (templateKey) {
      const templateIndex = localTemplates.findIndex(
        (tmplt: Template) => tmplt.key === templateKey,
      );
      if (templateIndex !== -1) {
        res.json(localTemplates[templateIndex]);
      }
    }
  }),

  getTemplateByTitle: asyncHandler(async (req: Request, res: Response) => {
    if (templates === null) {
      TemplateService.initializeTemplates();
    }
    const templatesData = fs.readFileSync(templatesPath, "utf8");
    const localTemplates = JSON.parse(templatesData) as Template[];
    const templateData = (await req.body) as Template | null;
    const templateTitle = templateData?.title;
    if (templateTitle) {
      const templateIndex = localTemplates.findIndex(
        (tmplt: Template) => tmplt.title === templateTitle,
      );
      if (templateIndex !== -1) {
        const apiResponse: PaletteAPIResponse<Template> = {
          success: true,
          message: "Template fetched successfully!",
          data: localTemplates[templateIndex],
        };
        res.json(apiResponse);
      }
    }
  }),
};
