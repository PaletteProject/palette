import React from "react";
import settingsJson from "../../../../backend/settings.json";
import { Template } from "palette-types";

interface TemplateUploadProps {
  closeImportCard: () => void; // callback to close the template import card
  onTemplateSelected: (template: Template) => void;
}

const TemplateUpload: React.FC<TemplateUploadProps> = ({
  closeImportCard,
  onTemplateSelected,
}: TemplateUploadProps) => {
  const handleImportTemplate = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    console.log("import template");

    const selectedTemplateTitle = event.currentTarget.textContent;

    for (const template of settingsJson.templates) {
      if (template.title === selectedTemplateTitle) {
        console.log("template", template);
        onTemplateSelected(template as Template);
      }
    }
    closeImportCard();
  };

  return (
    <div className={"flex justify-center items-center gap-10"}>
      <ul>
        {settingsJson.templates.map((t, tKey) => (
          <li key={tKey} onClick={handleImportTemplate}>
            <button>{t.title}</button>
            <br />
            <br />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TemplateUpload;
