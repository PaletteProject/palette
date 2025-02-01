import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Template } from "palette-types";
import { useFetch } from "src/hooks/useFetch";
import { createTemplate } from "src/utils/templateFactory.ts";
import { useEditModal } from "./EditModalProvider";

interface TemplateContextType {
  newTemplate: Template | null;
  setNewTemplate: (template: Template) => void;
  deletingTemplate: Template | null;
  setDeletingTemplate: (template: Template) => void;
  templates: Template[];
  setTemplates: (templates: Template[]) => void;
  handleSubmitTemplate: () => void;
  focusedTemplateKey: string | null;
  setFocusedTemplateKey: (key: string | null) => void;
  handleDuplicateTemplate: (template: Template) => void;
  selectedTemplates: string[];
  setSelectedTemplates: (templates: string[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  selectedTagFilters: string[];
  setSelectedTagFilters: (filters: string[]) => void;
  showBulkActions: boolean;
  setShowBulkActions: (show: boolean) => void;
  selectAll: boolean;
  setSelectAll: (select: boolean) => void;
  sortConfig: {
    key: "title" | "dateCreated" | "lastModified";
    direction: "asc" | "desc";
  };

  setSortConfig: (config: {
    key: "title" | "dateCreated" | "lastModified";
    direction: "asc" | "desc";
  }) => void;
  layoutStyle: "list" | "grid";
  setLayoutStyle: (style: "list" | "grid") => void;
  modal: {
    isOpen: boolean;
    title: string;
    message: string;
    choices: { label: string; action: () => void }[];
  };
  setModal: (modal: {
    isOpen: boolean;
    title: string;
    message: string;
    choices: { label: string; action: () => void }[];
  }) => void;
  closeModal: () => void;
  handleRemoveTemplate: (index: number) => void;
  handleUpdateTemplate: (index: number, template: Template) => void;
}

const TemplatesContext = createContext<TemplateContextType>({
  newTemplate: null,
  setNewTemplate: () => {},
  deletingTemplate: null,
  setDeletingTemplate: () => {},
  templates: [],
  setTemplates: () => {},
  handleSubmitTemplate: () => {},
  focusedTemplateKey: null,
  setFocusedTemplateKey: () => {},
  handleDuplicateTemplate: () => {},
  selectedTemplates: [],
  setSelectedTemplates: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
  showSuggestions: false,
  setShowSuggestions: () => {},
  selectedTagFilters: [],
  setSelectedTagFilters: () => {},
  sortConfig: {
    key: "title",
    direction: "asc",
  },
  setSortConfig: () => {},
  layoutStyle: "list",
  setLayoutStyle: () => {},
  showBulkActions: false,
  setShowBulkActions: () => {},
  selectAll: false,
  setSelectAll: () => {},
  setModal: () => {},

  modal: {
    isOpen: false,
    title: "",
    message: "",
    choices: [] as { label: string; action: () => void }[],
  },
  closeModal: () => {},
  handleRemoveTemplate: () => {},
  handleUpdateTemplate: () => {},
});

export function useTemplatesContext() {
  return useContext(TemplatesContext);
}

export function TemplateProvider({ children }: { children: ReactNode }) {
  const [focusedTemplateKey, setFocusedTemplateKey] = useState<string | null>(
    null
  );
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [newTemplate, setNewTemplate] = useState<Template | null>(null);

  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(
    null
  );
  const [layoutStyle, setLayoutStyle] = useState<"list" | "grid">("list");
  const [sortConfig, setSortConfig] = useState<{
    key: "title" | "dateCreated" | "lastModified";
    direction: "asc" | "desc";
  }>({ key: "title", direction: "asc" });

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  const { fetchData: getAllTemplates } = useFetch("/templates", {
    method: "GET",
  });

  const { fetchData: deleteTemplate } = useFetch(
    `/templates/byKey/${deletingTemplate?.key}`,
    {
      method: "DELETE",
    }
  );

  const { fetchData: postTemplate } = useFetch("/templates", {
    method: "POST",
    body: JSON.stringify(newTemplate), // use latest rubric data
  });

  const closeModal = useCallback(
    () => setModal((prevModal) => ({ ...prevModal, isOpen: false })),
    []
  );
  // object containing related modal state
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    choices: [] as { label: string; action: () => void }[],
  });

  const { isEditModalOpen, setIsEditModalOpen } = useEditModal();

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

  useEffect(() => {
    console.log("deletingTemplate changed", deletingTemplate);
    if (deletingTemplate) {
      void (async () => {
        const response = await deleteTemplate();
        if (response.success) {
          setTemplates(
            templates.filter(
              (template) => template.key !== deletingTemplate.key
            )
          );
        }
      })();
    }
  }, [deletingTemplate]);

  const handleUpdateTemplate = (index: number, template: Template) => {
    if (!template) return;
    // console.log("template to update", template);
    setNewTemplate(template);
  };

  const handleSubmitTemplate = () => {
    void (async () => {
      try {
        const response = await postTemplate();

        if (response.success) {
          // The templates will be automatically updated through the context
          // No need to fetch again
          console.log("Template submitted successfully");
          const response = await getAllTemplates();
          if (response.success) {
            setTemplates(response.data as Template[]);
          } else {
            console.error("Failed to fetch templates:", response);
          }
        } else {
          console.error("Template submission failed:", response);
        }
      } catch (error) {
        console.error("Error submitting template:", error);
      }
    })();
    setIsEditModalOpen(false);
  };

  const handleDuplicateTemplate = (template: Template) => {
    const duplicatedTemplate = { ...template, key: crypto.randomUUID() };
    setTemplates([...templates, duplicatedTemplate]);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleRemoveTemplate = (index: number) => {
    if (!templates) return;

    setDeletingTemplate(templates[index]);
  };

  return (
    <TemplatesContext.Provider
      value={{
        newTemplate,
        setNewTemplate,
        templates,
        setTemplates,
        deletingTemplate,
        setDeletingTemplate,
        handleSubmitTemplate,
        focusedTemplateKey,
        setFocusedTemplateKey,
        handleDuplicateTemplate,
        selectedTemplates,
        setSelectedTemplates,
        searchQuery,
        setSearchQuery,
        showSuggestions,
        setShowSuggestions,
        selectedTagFilters,
        setSelectedTagFilters,
        sortConfig,
        setSortConfig,
        layoutStyle,
        setLayoutStyle,
        showBulkActions,
        setShowBulkActions,
        selectAll,
        setSelectAll,
        modal,
        setModal,
        closeModal,
        handleRemoveTemplate,
        handleUpdateTemplate,
      }}
    >
      {children}
    </TemplatesContext.Provider>
  );
}
