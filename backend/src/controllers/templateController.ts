import { TemplateService } from "../TemplatesAPI/templateRequests.js";
import { Template } from "palette-types";
import { Criteria } from "palette-types";

export const getAllTemplates = () => {};

export const addTemplate = (criterion: Criteria) => {
  TemplateService.addTemplates(criterion);
};
