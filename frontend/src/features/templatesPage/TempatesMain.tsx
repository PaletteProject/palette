/**
 * Rubric Builder view.
 */

import { ReactElement } from "react";
import { MainPageTemplate } from "@components";
import { createTemplate } from "src/utils/templateFactory.ts";
import { createCriterion } from "../../utils/rubricFactory.ts";
import { TemplateProvider } from "./TemplateContext.tsx";
import { EditModalProvider } from "./EditModalProvider.tsx";
export default function TemplatesMain(): ReactElement {
  // quick start template for testing
  const quickStartTemplate = createTemplate();
  quickStartTemplate.title = "Quick Start Template";
  quickStartTemplate.tags = [
    { id: crypto.randomUUID(), name: "Quick Start", color: "#3B82F6" },
  ];
  quickStartTemplate.key = crypto.randomUUID();
  quickStartTemplate.createdAt = new Date();
  quickStartTemplate.lastUsed = "Never";
  quickStartTemplate.usageCount = 0;
  quickStartTemplate.criteria = [createCriterion()];
  quickStartTemplate.criteria[0].description = "This is a test description";
  quickStartTemplate.criteria[0].longDescription =
    "This is a test long description";
  quickStartTemplate.criteria[0].id = "crit1";
  quickStartTemplate.criteria[0].templateTitle = "Quick Start Template";
  quickStartTemplate.criteria[0].template = quickStartTemplate.key;

  return (
    <>
      <EditModalProvider>
        <TemplateProvider>
          <MainPageTemplate />
        </TemplateProvider>
      </EditModalProvider>
    </>
  );
}
