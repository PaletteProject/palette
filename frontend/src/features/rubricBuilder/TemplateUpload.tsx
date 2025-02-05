import React, { useEffect, useState } from "react";
import { Template } from "palette-types";
import { useFetch } from "@hooks";

interface TemplateUploadProps {
  closeImportCard: () => void; // callback to close the template import card
  onTemplateSelected: (template: Template) => void;
}

const TemplateUpload: React.FC<TemplateUploadProps> = ({
  closeImportCard,
  onTemplateSelected,
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
