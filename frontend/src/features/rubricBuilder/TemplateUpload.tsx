import React, { useState, useEffect } from "react";
import { Template } from "palette-types";
import { useFetch } from "src/hooks/useFetch";

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
    <div className={"flex justify-center items-center gap-10"}>
      <ul>
        {templates.map((t, tKey) => (
          <li key={tKey} onClick={(event) => void handleImportTemplate(event)}>
            <br />
            <button>{t.title}</button>
            <br />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TemplateUpload;
