import { TemplateService } from "../TemplatesAPI/templateRequests.js";
import { Request, Response } from "express";

export const addTemplate = async (req: Request, res: Response) => {
  const response = await TemplateService.addTemplate(req, res, () => {});
  return response;
};

export const updateTemplate = async (req: Request, res: Response) => {
  const response = await TemplateService.updateTemplate(req, res, () => {});
  return response;
};

export const deleteTemplateByTitle = async (req: Request, res: Response) => {
  const response = await TemplateService.deleteTemplateByTitle(
    req,
    res,
    () => {},
  );
  return response;
};

export const deleteTemplateByKey = async (req: Request, res: Response) => {
  const response = await TemplateService.deleteTemplateByKey(
    req,
    res,
    () => {},
  );
  return response;
};

export const getAllTemplates = async (req: Request, res: Response) => {
  const response = await TemplateService.getAllTemplates(req, res, () => {});
  return response;
};

export const getTemplateByKey = async (req: Request, res: Response) => {
  const response = await TemplateService.getTemplateByKey(req, res, () => {});
  return response;
};

export const getTemplateByTitle = async (req: Request, res: Response) => {
  const response = await TemplateService.getTemplateByTitle(req, res, () => {});
  return response;
};
