import { useState } from "react";
import { Template } from "palette-types";

export const useTemplate = () => {
  // this template tracks the template that is currently being updated
  const [updatingTemplate, setUpdatingTemplate] = useState<Template | null>(
    null,
  );

  // this template tracks the template that is currently being imported
  const [importingTemplate, setImportingTemplate] = useState<Template | null>(
    null,
  );
  const [templateInputActive, setTemplateInputActive] = useState(false);

  return {
    updatingTemplate,
    importingTemplate,
    templateInputActive,
    setImportingTemplate,
    setUpdatingTemplate,
    setTemplateInputActive,
  };
};
