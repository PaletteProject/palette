import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { Template } from "palette-types";
import { useFetch } from "src/hooks/useFetch";
import { createTemplate } from "src/utils/templateFactory.ts";

interface TemplateContextType {
  newTemplate: Template | null;
  setNewTemplate: (template: Template) => void;
  templates: Template[];
  setTemplates: (templates: Template[]) => void;
}

const TemplatesContext = createContext<TemplateContextType>({
  newTemplate: null,
  setNewTemplate: () => {},
  templates: [],
  setTemplates: () => {},
});

export function useTemplatesContext() {
  return useContext(TemplatesContext);
}

export function TemplateProvider({ children }: { children: ReactNode }) {
  const [newTemplate, setNewTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const { fetchData: getAllTemplates } = useFetch("/templates", {
    method: "GET",
  });

  // Update the initial fetch useEffect
  useEffect(() => {
    void (async () => {
      try {
        const response = await getAllTemplates();
        if (response.success) {
          console.log("template provider response", response.data);
          setTemplates(response.data as Template[]);
        } else {
          console.error("Failed to fetch templates:", response);
        }
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      }
    })();
  }, []);

  useEffect(() => {
    console.log("templates changed", templates);
  }, [templates]);

  return (
    <TemplatesContext.Provider
      value={{ newTemplate, setNewTemplate, templates, setTemplates }}
    >
      {children}
    </TemplatesContext.Provider>
  );
}
