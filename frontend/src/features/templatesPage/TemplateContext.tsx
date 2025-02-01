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

interface TemplateContextType {
  newTemplate: Template | null;
  setNewTemplate: (template: Template) => void;
  deletingTemplate: Template | null;
  deletingTemplates: Template[] | null;
  setDeletingTemplates: (templates: Template[]) => void;
  setDeletingTemplate: (template: Template) => void;
  templates: Template[];
  setTemplates: (templates: Template[]) => void;
  handleSubmitTemplate: () => void;
  focusedTemplateKey: string | null;
  setFocusedTemplateKey: (key: string | null) => void;
  handleDuplicateTemplate: () => void;
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
  handleCreateTemplate: () => void;
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
  handleQuickStart: () => void;
  isNewTemplate: boolean;
  setIsNewTemplate: (isNewTemplate: boolean) => void;
  index: number;
  setIndex: (index: number) => void;
  duplicateTemplate: Template | null;
  setDuplicateTemplate: (template: Template) => void;
  viewOrEdit: "view" | "edit";
  setViewOrEdit: (viewOrEdit: "view" | "edit") => void;
  editingTemplate: Template | null;
  setEditingTemplate: (template: Template) => void;
}

const TemplatesContext = createContext<TemplateContextType>({
  newTemplate: null,
  setNewTemplate: () => {},
  deletingTemplate: null,
  deletingTemplates: null,
  setDeletingTemplates: () => {},
  setDeletingTemplate: () => {},
  templates: [],
  setTemplates: () => {},
  handleSubmitTemplate: () => {},
  focusedTemplateKey: null,
  setFocusedTemplateKey: () => {},
  handleQuickStart: () => {},
  handleDuplicateTemplate: () => {},
  selectedTemplates: [],
  setSelectedTemplates: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
  showSuggestions: false,
  setShowSuggestions: () => {},
  selectedTagFilters: [],
  setSelectedTagFilters: () => {},
  handleCreateTemplate: () => {},
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
  isNewTemplate: false,
  setIsNewTemplate: () => {},
  index: 0,
  setIndex: () => {},
  duplicateTemplate: null,
  setDuplicateTemplate: () => {},
  viewOrEdit: "view",
  setViewOrEdit: () => {},
  editingTemplate: null,
  setEditingTemplate: () => {},
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
  const [newTemplate, setNewTemplate] = useState<Template | null>(
    createTemplate()
  );
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(
    createTemplate()
  );
  const [isNewTemplate, setIsNewTemplate] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(
    null
  );
  const [index, setIndex] = useState(0);
  const [deletingTemplates, setDeletingTemplates] = useState<Template[]>([]);
  const [layoutStyle, setLayoutStyle] = useState<"list" | "grid">("list");
  const [sortConfig, setSortConfig] = useState<{
    key: "title" | "dateCreated" | "lastModified";
    direction: "asc" | "desc";
  }>({ key: "title", direction: "asc" });

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [duplicateTemplate, setDuplicateTemplate] = useState<Template | null>(
    null
  );
  const [viewOrEdit, setViewOrEdit] = useState<"view" | "edit">("view");
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
    body: JSON.stringify(editingTemplate), // use latest rubric data
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

  // Update the initial fetch useEffect

  useEffect(() => {
    void (async () => {
      try {
        const response = await getAllTemplates();
        setShowBulkActions(false); // this needs to be here to prevent bulk actions from being shown when the page is loaded in case the last thing that was done was a bulk delete

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

  useEffect(() => {
    if (deletingTemplates.length > 0) {
      void (async () => {
        try {
          // Delete all templates in parallel

          for (const template of deletingTemplates) {
            console.log("deleting temoakte", deletingTemplates);
            setDeletingTemplate(template);

            await deleteTemplate();
          }

          const response = await getAllTemplates();
          if (response.success) {
            setTemplates(response.data as Template[]);
          } else {
            console.error("Failed to fetch templates:", response);
          }
        } catch (error) {
          console.error("Error deleting templates:", error);
        }
      })();
    }
  }, [deletingTemplates]);

  const handleCreateTemplate = () => {
    const newTemplate = createTemplate();
    newTemplate.createdAt = new Date();
    newTemplate.lastUsed = "Never";
    newTemplate.usageCount = 0;
    newTemplate.key = crypto.randomUUID();
    setTemplates([...templates, newTemplate]);
    setEditingTemplate(newTemplate);
    setViewOrEdit("edit");
    setIndex(templates.length);

    setIsNewTemplate(true);
  };

  const handleDuplicateTemplate = () => {
    const baseName = duplicateTemplate?.title.replace(/\s*\(\d+\)$/, ""); // Remove existing numbers in parentheses
    let counter = 1;
    let newTitle = `${baseName} (${counter})`;

    // Find an available number for the copy
    while (
      templates.some((t) => t.title.toLowerCase() === newTitle.toLowerCase())
    ) {
      counter++;
      newTitle = `${baseName} (${counter})`;
    }

    console.log("newTitle", newTitle);

    const copiedTemplate: Template = {
      ...duplicateTemplate,
      key: crypto.randomUUID(),
      title: newTitle,
      createdAt: new Date(),

      lastUsed: new Date(),
      usageCount: 0,
      criteria: duplicateTemplate?.criteria || [],
      tags: duplicateTemplate?.tags || [],
      description: duplicateTemplate?.description || "",
      points: duplicateTemplate?.points || 0,
    };

    setTemplates([...templates, copiedTemplate]);
    setIndex(templates.length);
    setIsNewTemplate(true);
  };

  const handleQuickStart = () => {
    console.log("quick start");
  };

  const handleUpdateTemplate = (index: number, template: Template) => {
    if (!template) return;
    setTemplates(templates.map((t) => (t.key === template.key ? template : t)));
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
        deletingTemplates,
        setDeletingTemplates,
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
        handleCreateTemplate,
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
        handleQuickStart,
        isNewTemplate,
        setIsNewTemplate,
        index,
        setIndex,
        duplicateTemplate,
        setDuplicateTemplate,
        viewOrEdit,
        setViewOrEdit,
        editingTemplate,
        setEditingTemplate,
      }}
    >
      {children}
    </TemplatesContext.Provider>
  );
}
