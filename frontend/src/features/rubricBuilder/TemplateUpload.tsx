import React, { useEffect, useState } from "react";
import { Criteria, Template } from "palette-types";
import { useFetch, useTemplate } from "@/hooks";
import { useChoiceDialog, useRubric } from "@/context";

interface TemplateUploadProps {
  closeImportCard: () => void; // callback to close the template import card
}

const TemplateUpload: React.FC<TemplateUploadProps> = ({
  closeImportCard,
}: TemplateUploadProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);

  const { fetchData: getAllTemplates } = useFetch("/templates", {
    method: "GET",
  });

  useEffect(() => {
    console.log("useEffect in template upload");
    (async () => {
      const response = await getAllTemplates();
      if (response.success) {
        setTemplates(response.data as Template[]);
      }
    })().catch((error) => {
      console.error("Failed to fetch templates:", error);
    });
  }, []);

  const handleImportTemplate = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    console.log("import template");

    const selectedTemplateTitle = event.currentTarget.textContent;
    console.log("templates", templates);

    for (const template of templates) {
      if (template.title === selectedTemplateTitle) {
        onTemplateSelected(template);
        break;
      }
    }

    closeImportCard();
  };

  const { setUpdatingTemplate, setImportingTemplate } = useTemplate();
  const { openDialog } = useChoiceDialog();
  const { activeRubric, setActiveRubric } = useRubric();

  const onTemplateSelected = (template: Template) => {
    const updatedTemplate = {
      ...template,
      usageCount: template.usageCount + 1,
      lastUsed: new Date().toISOString(),
    };

    setUpdatingTemplate(updatedTemplate);
    if (!activeRubric) return;

    const currentCriteria = activeRubric.criteria;
    const newCriteria = template.criteria;

    if (newCriteria.length === 0) {
      openDialog({
        title: "No Criteria Detected",
        message: "This template has no criteria",
        buttons: [],
      });
      return;
    }

    // Split into unique and duplicate criteria
    const { unique, duplicates } = newCriteria.reduce(
      (acc, newCriterion) => {
        const isDuplicate = currentCriteria.some(
          (existingCriterion) =>
            existingCriterion.key.trim().toLowerCase() ===
            newCriterion.key.trim().toLowerCase(),
        );

        if (isDuplicate) {
          acc.duplicates.push(newCriterion);
        } else {
          acc.unique.push(newCriterion);
        }

        return acc;
      },
      { unique: [] as Criteria[], duplicates: [] as Criteria[] },
    );

    // Log information about duplicates if any were found
    if (duplicates.length > 0) {
      const duplicateDescriptions = duplicates
        .map((criterion) => criterion.description)
        .join(", ");

      openDialog({
        title: "Duplicate Criteria Detected",
        message: `Looks like you already imported this one. Duplicate criteria: ${duplicateDescriptions}`,
        buttons: [],
      });
      return;
    }

    setActiveRubric({
      ...activeRubric,
      criteria: [...currentCriteria, ...unique],
    });
    setImportingTemplate(updatedTemplate);
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
      <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 w-full">
        {templates.map((t, tKey) => {
          return (
            <div
              key={tKey}
              onClick={(event) => void handleImportTemplate(event)}
              className="text-center border border-gray-600 rounded-lg p-2 hover:bg-gray-600 w-full cursor-pointer"
            >
              {t.title}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateUpload;
