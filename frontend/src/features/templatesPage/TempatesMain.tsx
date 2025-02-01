/**
 * Rubric Builder view.
 */

import { ReactElement, useCallback, useEffect, useState } from "react";
import {
  ModalChoiceDialog,
  PopUp,
  EditTemplateModal,
  Navbar,
  MainPageTemplate,
} from "@components";
import { Template, Tag } from "palette-types";
import TemplateCard from "./TemplateCards.tsx";
import { useFetch } from "@hooks";
import { createTemplate } from "src/utils/templateFactory.ts";
import TemplateTagModal from "src/components/modals/TemplateTagModal.tsx";
import TemplateSearch from "./TemplateSearch.tsx";
import AddTemplateTag from "./AddTemplateTag.tsx";
import TemplatesWindow from "./TemplatesWindow.tsx";
import TemplateSorter from "./TemplateSorter.tsx";
import { createCriterion } from "../../utils/rubricFactory.ts";
import { TemplateProvider } from "./TemplateContext.tsx";
import { useTemplatesContext } from "./TemplateContext.tsx";
import { EditModalProvider } from "./EditModalProvider.tsx";
import { useEditModal } from "./EditModalProvider.tsx";
export default function TemplatesMain(): ReactElement {
  const { templates, setTemplates } = useTemplatesContext();
  const { newTemplate, setNewTemplate } = useTemplatesContext();
  const { isEditModalOpen, setIsEditModalOpen } = useEditModal();
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
  quickStartTemplate.criteria[0].id = 1;
  quickStartTemplate.criteria[0].templateTitle = "Quick Start Template";
  quickStartTemplate.criteria[0].template = quickStartTemplate.key;

  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [doingQuickStart, setDoingQuickStart] = useState(false);

  // Add new state for quick edit mode
  const [focusedTemplateKey, setFocusedTemplateKey] = useState<string | null>(
    null
  );

  const [tagModalOpen, setTagModalOpen] = useState(false);

  // Add new state for sorting
  const [sortConfig, setSortConfig] = useState<{
    key: "title" | "dateCreated" | "lastModified";
    direction: "asc" | "desc";
  }>({ key: "title", direction: "asc" });

  // Add new state for selected templates
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  // Add new states for tags
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);

  // Add new state for suggestions  // Add new state for suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);

  // declared before, so it's initialized for the modal initial state. memoized for performance
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

  const closePopUp = useCallback(
    () => setPopUp((prevPopUp) => ({ ...prevPopUp, isOpen: false })),
    []
  );

  const [popUp, setPopUp] = useState({
    isOpen: false,
    title: "",
    message: "",
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

  const handleSubmitTemplate = () => {
    void (async () => {
      try {
        setIsEditModalOpen(false);
        const response = await postTemplate();

        if (response.success) {
          // The templates will be automatically updated through the context
          // No need to fetch again
          console.log("Template submitted successfully");
        } else {
          console.error("Template submission failed:", response);
        }
      } catch (error) {
        console.error("Error submitting template:", error);
      }
    })();
  };

  const handleQuickStart = () => {
    console.log("handleQuickStart", templates);
  };

  const handleCreateTemplate = () => {
    const newTemplate = createTemplate();
    const currentDate = new Date();
    newTemplate.createdAt = currentDate;
    newTemplate.lastUsed = "Never";
    setTemplates([...templates, newTemplate]);
    setNewTemplate(newTemplate);
    setIsEditModalOpen(true);
  };

  const handleDuplicateTemplate = (template: Template) => {
    const duplicatedTemplate = { ...template, key: crypto.randomUUID() };
    setTemplates([...templates, duplicatedTemplate]);
  };

  const handleRemoveTemplate = (index: number) => {
    if (!templates) return;

    setModal({
      isOpen: true,
      title: "Confirm Template Removal",
      message: `Are you sure you want to remove ${templates[index].title}? This action is (currently) not reversible.`,
      choices: [
        {
          label: "Destroy it!",
          action: () => {
            setDeletingTemplate(templates[index]);
            closeModal();
          },
        },
      ],
    });
  };

  const handleUpdateTemplate = (index: number, template: Template) => {
    if (!template) return;
    setNewTemplate(template);
  };

  const handleUpdateSelectedTemplates = (templateKeys: string[]) => {
    setSelectedTemplates(templateKeys);
  };

  const handleBulkDelete = () => {
    console.log("selectedTemplates in handleBulkDelete", selectedTemplates);
    setModal({
      isOpen: true,
      title: "Confirm Bulk Delete",
      message: `Are you sure you want to delete ${selectedTemplates.length} templates? This action cannot be undone.`,
      choices: [
        {
          label: "Delete All Selected",
          action: () => {
            void (async () => {
              try {
                // Delete each selected template
                for (const templateKey of selectedTemplates) {
                  setDeletingTemplate(
                    templates.find((t) => t.key === templateKey) as Template
                  );
                  const response = await deleteTemplate();
                  if (response.success) {
                    const newTemplates = templates.filter(
                      (t) => t.key !== templateKey
                    );
                    setTemplates(newTemplates);
                  }
                  console.log("delete response", response);
                }
                // Refresh templates list
                closeModal();
              } catch (error) {
                console.error("Error during bulk delete:", error);
              }
            })();
          },
        },
        {
          label: "Cancel",
          action: closeModal,
        },
      ],
    });
  };

  // Add tag modal component
  const renderTagModal = () => {
    return (
      <TemplateTagModal
        isOpen={tagModalOpen}
        onClose={() => setTagModalOpen(false)}
        setAvailableTags={setAvailableTags}
      />
    );
  };

  // Add this function before the renderTemplatesContent
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // The TemplatesWindow component already handles the filtering based on searchQuery,
    // so we just need to update the searchQuery state
  };

  /**
   * Helper function to consolidate conditional rendering in the JSX.
   */

  // Add click outside handler to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".search-container")) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {isEditModalOpen && (
        <EditTemplateModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          children={
            <TemplateCard
              index={templates.length}
              updateTemplateHandler={handleUpdateTemplate}
              removeTemplate={handleRemoveTemplate}
              isNewTemplate={true}
              submitTemplateHandler={handleSubmitTemplate}
              existingTemplates={templates}
              layoutStyle={"list"}
              templateFocused={focusedTemplateKey === newTemplate?.key}
              onTemplateFocusedToggle={() =>
                setFocusedTemplateKey(
                  focusedTemplateKey === newTemplate?.key
                    ? null
                    : newTemplate?.key || null
                )
              }
              isSelected={selectedTemplates.includes(newTemplate?.key || "")}
              duplicateTemplate={handleDuplicateTemplate}
              viewOrEdit="edit"
            />
          }
        />
      )}
      <EditModalProvider>
        <TemplateProvider>
          <MainPageTemplate />
        </TemplateProvider>
      </EditModalProvider>
    </>
  );
}
