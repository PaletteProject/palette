import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Tag, Template } from "palette-types";
import { useFetch } from "src/hooks/useFetch";
import { createTemplate } from "src/utils/templateFactory.ts";
import { quickStartTemplates } from "./QuickStartTemplates";

interface TemplateContextType {
  addingTagFromBuilder: boolean;
  setAddingTagFromBuilder: (addingTagFromBuilder: boolean) => void;
  newTemplate: Template | null;
  setNewTemplate: (template: Template) => void;
  deletingTemplate: Template | null;
  deletingTemplates: Template[] | null;
  setDeletingTemplates: (templates: Template[]) => void;
  setDeletingTemplate: (template: Template) => void;
  templates: Template[];
  setTemplates: (templates: Template[]) => void;
  handleSubmitNewTemplate: () => void;
  handleSubmitEditedTemplate: () => void;
  focusedTemplateKey: string | null;
  setFocusedTemplateKey: (key: string | null) => void;
  handleDuplicateTemplate: (key: string) => void;
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
    key: "title" | "dateCreated" | "lastModified" | "usageCount";
    direction: "asc" | "desc";
  };

  setSortConfig: (config: {
    key: "title" | "dateCreated" | "lastModified" | "usageCount";
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
  handleRemoveTemplate: (key: string) => void;
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
  viewingTemplate: Template | null;
  setViewingTemplate: (template: Template) => void;
  availableTags: Tag[];
  setAvailableTags: (tags: Tag[]) => void;
  tagModalOpen: boolean;
  setTagModalOpen: (tagModalOpen: boolean) => void;
  handleBulkCreateTemplates: () => void;
  handleBulkDeleteTemplates: () => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
}

const TemplatesContext = createContext<TemplateContextType>({
  addingTagFromBuilder: false,
  setAddingTagFromBuilder: () => {},
  newTemplate: null,
  setNewTemplate: () => {},
  deletingTemplate: null,
  deletingTemplates: null,
  setDeletingTemplates: () => {},
  setDeletingTemplate: () => {},
  templates: [],
  setTemplates: () => {},
  handleSubmitNewTemplate: () => {},
  handleSubmitEditedTemplate: () => {},
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
  availableTags: [],
  setAvailableTags: () => {},
  setTagModalOpen: () => {},
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
  viewingTemplate: null,
  setViewingTemplate: () => {},
  tagModalOpen: false,
  handleBulkCreateTemplates: () => {},
  handleBulkDeleteTemplates: () => {},
  hasUnsavedChanges: false,
  setHasUnsavedChanges: () => {},
});

export function useTemplatesContext() {
  return useContext(TemplatesContext);
}

export function TemplateProvider({ children }: { children: ReactNode }) {
  const [focusedTemplateKey, setFocusedTemplateKey] = useState<string | null>(
    null,
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [newTemplate, setNewTemplate] = useState<Template | null>(
    createTemplate(),
  );
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(
    createTemplate(),
  );
  const [isNewTemplate, setIsNewTemplate] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(
    null,
  );
  const [index, setIndex] = useState(0);
  const [addingTagFromBuilder, setAddingTagFromBuilder] = useState(false);
  const [deletingTemplates, setDeletingTemplates] = useState<Template[]>([]);
  const [layoutStyle, setLayoutStyle] = useState<"list" | "grid">("list");

  const [sortConfig, setSortConfig] = useState<{
    key: "title" | "dateCreated" | "lastModified" | "usageCount";
    direction: "asc" | "desc";
  }>({ key: "title", direction: "asc" });

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [duplicateTemplate, setDuplicateTemplate] = useState<Template | null>(
    null,
  );
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [viewOrEdit, setViewOrEdit] = useState<"view" | "edit">("view");
  const { fetchData: getAllTemplates } = useFetch("/templates", {
    method: "GET",
  });
  const [viewingTemplate, setViewingTemplate] = useState<Template | null>(null);

  const { fetchData: deleteTemplate } = useFetch(
    `/templates/byKey/${deletingTemplate?.key}`,

    {
      method: "DELETE",
    },
  );

  const { fetchData: postTemplate } = useFetch("/templates", {
    method: "POST",
    body: JSON.stringify(editingTemplate), // use latest rubric data
  });

  const { fetchData: putTemplate } = useFetch("/templates", {
    method: "PUT",
    body: JSON.stringify(editingTemplate),
  });

  const { fetchData: deleteTemplates } = useFetch("/templates/bulk", {
    method: "DELETE",
    body: JSON.stringify(deletingTemplates),
  });

  const { fetchData: addTemplates } = useFetch("/templates/bulk", {
    method: "POST",
    body: JSON.stringify(editingTemplate),
  });

  const closeModal = useCallback(
    () => setModal((prevModal) => ({ ...prevModal, isOpen: false })),
    [],
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
              (template) => template.key !== deletingTemplate.key,
            ),
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
    const template = createTemplate();
    template.createdAt = new Date();
    template.lastUsed = "Never";
    template.usageCount = 23;
    template.key = crypto.randomUUID();
    setEditingTemplate(template);
    setViewOrEdit("edit");
    setIsNewTemplate(true);
  };

  const handleBulkCreateTemplates = async () => {
    const response = await addTemplates();
    if (response.success) {
      setTemplates(response.data as Template[]);
    } else {
      console.error("Failed to add templates:", response);
    }
  };

  const handleBulkDeleteTemplates = async () => {
    console.log(
      "selectedTemplates in handleBulkDeleteTemplates",
      deletingTemplates,
    );
    const response = await deleteTemplates();
    if (response.success) {
      setTemplates(response.data as Template[]);
    } else {
      console.error("Failed to delete templates:", response);
    }
  };

  const handleDuplicateTemplate = (key: string) => {
    const templateToCopy = templates.find((t) => t.key === key);
    if (!templateToCopy) return;

    const baseName = templateToCopy?.title.replace(/\s*\(\d+\)$/, ""); // Remove existing numbers in parentheses
    let counter = 1;
    let newTitle = `${baseName} (${counter})`;

    // Find an available number for the copy
    while (
      templates.some((t) => t.title.toLowerCase() === newTitle.toLowerCase())
    ) {
      counter++;
      newTitle = `${baseName} (${counter})`;
    }

    // console.log("newTitle", newTitle);

    const copiedTemplate: Template = {
      ...templateToCopy,
      key: crypto.randomUUID(),
      title: newTitle,
      createdAt: new Date(),
      lastUsed: "",
      usageCount: 0,
      criteria: templateToCopy?.criteria || [],
      tags: templateToCopy?.tags || [],
      description: templateToCopy?.description || "",
      points: templateToCopy?.points || 0,
    };

    setTemplates([...templates, copiedTemplate]);
    setIndex(templates.length);
    setIsNewTemplate(true);
  };

  const handleQuickStart = () => {
    setTemplates(quickStartTemplates);
    console.log("quick start");
  };

  const handleUpdateTemplate = (index: number, template: Template) => {
    if (!template) return;
    setTemplates(templates.map((t) => (t.key === template.key ? template : t)));
  };

  const handleSubmitNewTemplate = () => {
    setTemplates([...templates, editingTemplate as Template]);
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

  const handleSubmitEditedTemplate = () => {
    void (async () => {
      try {
        const response = await putTemplate();

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

  const handleRemoveTemplate = (key: string) => {
    if (!templates) return;

    const templateToRemove = templates.find((t) => t.key === key);
    if (!templateToRemove) return;

    setDeletingTemplate(templateToRemove);
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
        handleSubmitNewTemplate,
        handleSubmitEditedTemplate,
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
        viewingTemplate,
        setViewingTemplate,
        availableTags,
        setAvailableTags,
        tagModalOpen,
        setTagModalOpen,
        addingTagFromBuilder,
        setAddingTagFromBuilder,
        handleBulkCreateTemplates: () => void handleBulkCreateTemplates(),
        handleBulkDeleteTemplates: () => void handleBulkDeleteTemplates(),
        hasUnsavedChanges,
        setHasUnsavedChanges,
      }}
    >
      {children}
    </TemplatesContext.Provider>
  );
}
