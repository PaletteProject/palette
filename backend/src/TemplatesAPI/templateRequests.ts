import { Template, Settings, PaletteAPIResponse } from "palette-types";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { createTemplate } from "../../../frontend/src/utils/templateFactory.js";
import fs from "fs";

const settingsPath = "./settings.json";

export const TemplateService = {
  // POST REQUESTS (Templates Setter/Page Functions)

  addTemplate: asyncHandler(async (req: Request, res: Response) => {
    console.log("template data", req.body);
    const settingsData = fs.readFileSync(settingsPath, "utf8");
    const settings: Settings = JSON.parse(settingsData) as Settings;
    const template = createTemplate();
    const templateData = (await req.body) as Template | null;
    if (templateData) {
      const templateIndex = settings.templates.findIndex(
        (tmplt) => tmplt.title === templateData.title,
      );
      template.title = templateData.title;
      template.criteria = templateData.criteria;
      template.id = templateData.id;
      template.key = templateData.key;
      if (templateIndex === -1) {
        // only push if the template doesn't already exist
        settings.templates.push(template);
        console.log("settings templates", settings.templates);
      } else {
        // update the existing template
        console.log("Template already exists!");
      }
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    }

    const apiResponse: PaletteAPIResponse<unknown> = {
      success: true,
      message: "Template created successfully!",
    };

    res.json(apiResponse);
  }),

  updateTemplate: asyncHandler(async (req: Request, res: Response) => {
    console.log("updating template request", req.body);
    const settingsData = fs.readFileSync(settingsPath, "utf8");
    const settings: Settings = JSON.parse(settingsData) as Settings;
    const templateData = (await req.body) as Template | null;
    if (templateData) {
      const templateIndex = settings.templates.findIndex(
        (tmplt) => tmplt.title === templateData.title,
      );
      console.log("templateIndex", templateIndex);
      console.log("templateData", templateData);
      if (templateIndex !== -1) {
        settings.templates[templateIndex] = templateData;

        console.log("updated templates", settings.templates);
        console.log("settings", settings);
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      }
    }

    const apiResponse: PaletteAPIResponse<unknown> = {
      success: true,
      message: "Template updated successfully!",
    };

    res.json(apiResponse);
  }),

  // DELETE REQUESTS (Templates Page Functions)
  deleteTemplateByKey: asyncHandler(async (req: Request, res: Response) => {
    const settingsData = fs.readFileSync(settingsPath, "utf8");
    const settings: Settings = JSON.parse(settingsData) as Settings;
    const templateData = (await req.body) as Template | null;
    const templateKey = templateData?.key;
    if (templateKey) {
      const templateIndex = settings.templates.findIndex(
        (tmplt) => tmplt.key === templateKey,
      );
      if (templateIndex !== -1) {
        settings.templates.splice(templateIndex, 1);
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      }
    }

    const apiResponse: PaletteAPIResponse<unknown> = {
      success: true,
      message: "Template deleted successfully!",
    };

    res.json(apiResponse);
  }),

  deleteAllCriteriaByTitle: asyncHandler(
    async (req: Request, res: Response) => {
      const settingsData = fs.readFileSync(settingsPath, "utf8");
      const settings: Settings = JSON.parse(settingsData) as Settings;
      const templateData = (await req.body) as Template | null;
      const templateTitle = templateData?.title;
      if (templateTitle) {
        const templateIndex = settings.templates.findIndex(
          (tmplt) => tmplt.title === templateTitle,
        );
        if (templateIndex !== -1) {
          settings.templates[templateIndex].criteria = [];
          fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
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
    const settingsData = fs.readFileSync(settingsPath, "utf8");
    const settings: Settings = JSON.parse(settingsData) as Settings;
    const templateData = (await req.body) as Template | null;
    const templateKey = templateData?.key;
    if (templateKey) {
      const templateIndex = settings.templates.findIndex(
        (tmplt) => tmplt.key === templateKey,
      );
      if (templateIndex !== -1) {
        settings.templates[templateIndex].criteria = [];
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
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
    const settingsData = fs.readFileSync(settingsPath, "utf8");
    const settings: Settings = JSON.parse(settingsData) as Settings;
    const templateData = (await req.body) as Template | null;
    const templateTitle = templateData?.title;
    if (templateTitle) {
      const templateIndex = settings.templates.findIndex(
        (tmplt) => tmplt.title === templateTitle,
      );
      if (templateIndex !== -1) {
        settings.templates.splice(templateIndex, 1);
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
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
    const settingsData = fs.readFileSync(settingsPath, "utf8");
    const settings: Settings = JSON.parse(settingsData) as Settings;
    const request = (await req.body) as JSON;
    if (request !== null) {
      res.json(settings.templates);
    }
  }),

  getTemplateByKey: asyncHandler(async (req: Request, res: Response) => {
    const settingsData = fs.readFileSync(settingsPath, "utf8");
    const settings: Settings = JSON.parse(settingsData) as Settings;
    const templateData = (await req.body) as Template | null;
    const templateKey = templateData?.key;
    if (templateKey) {
      const templateIndex = settings.templates.findIndex(
        (tmplt) => tmplt.key === templateKey,
      );
      if (templateIndex !== -1) {
        res.json(settings.templates[templateIndex]);
      }
    }
  }),

  getTemplateByTitle: asyncHandler(async (req: Request, res: Response) => {
    const settingsData = fs.readFileSync(settingsPath, "utf8");
    const settings: Settings = JSON.parse(settingsData) as Settings;
    const templateData = (await req.body) as Template | null;
    const templateTitle = templateData?.title;
    if (templateTitle) {
      const templateIndex = settings.templates.findIndex(
        (tmplt) => tmplt.title === templateTitle,
      );
      console.log("templateIndex", templateIndex);
      if (templateIndex !== -1) {
        res.json(settings.templates[templateIndex]);
      }
    }
  }),
};
