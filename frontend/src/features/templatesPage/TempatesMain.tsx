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

export default function TemplatesMain(): ReactElement {
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

  const [templates, setTemplates] = useState<Template[]>([]);
  const [newTemplate, setNewTemplate] = useState<Template>(quickStartTemplate);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Update the initial fetch useEffect
  useEffect(() => {
    void (async () => {
      try {
        const response = await getAllTemplates();
        if (response.success) {
          console.log("response.data", response.data);
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
    if (deletingTemplate) {
      void (async () => {
        try {
          const response = await deleteTemplate();
          console.log("delete response", response);
          if (response.success) {
            const newTemplates = templates.filter(
              (t) => t.key !== deletingTemplate.key
            );
            setTemplates(newTemplates);
            setDeletingTemplate(null);
          }
        } catch (error) {
          console.error("Error deleting template:", error);
        }
      })();
    }
  }, [deletingTemplate]);

  useEffect(() => {
    if (newTemplate.title !== "") {
      void (async () => {
        try {
          console.log("newTemplate in postTemplate", newTemplate);
          const response = await postTemplate();
          console.log("post response", response);
          if (response.success) {
            const newTemplates = templates.filter(
              (t) => t.key !== newTemplate.key
            );
            setTemplates(newTemplates);
          }
        } catch (error) {
          console.error("Error posting template:", error);
        }
      })();
    }
  }, [newTemplate]);

  const handleSubmitTemplate = () => {
    void (async () => {
      try {
        setIsEditModalOpen(false);

        const response = await postTemplate();
        console.log("Template submission response:", response);

        if (response.success) {
          const templatesResponse = await getAllTemplates();
          if (templatesResponse.success) {
            setTemplates(templatesResponse.data as Template[]);
            console.log("templates after submission", templatesResponse.data);
          } else {
            console.error(
              "Failed to fetch updated templates:",
              templatesResponse
            );
          }
        } else {
          console.error("Template submission failed:", response);
        }
      } catch (error) {
        console.error("Error submitting template:", error);
      }
    })();
  };

  const handleCreateTemplate = () => {
    const newTemplate = createTemplate();
    const currentDate = new Date();
    newTemplate.createdAt = currentDate;
    newTemplate.lastUsed = "Never";
    setNewTemplate(newTemplate);
    setIsEditModalOpen(true);
  };

  const handleBatchCreateTemplate = () => {
    const starterTemplates = [
      {
        title: "Weekly Assignment Rubric",
        tags: [
          { id: crypto.randomUUID(), name: "Assignment", color: "#3B82F6" },
        ] as Tag[],
      },
      {
        title: "Final Project Evaluation",
        tags: [
          { id: crypto.randomUUID(), name: "Project", color: "#EF4444" },
          { id: crypto.randomUUID(), name: "Final", color: "#10B981" },
        ] as Tag[],
      },
      {
        title: "Participation Assessment",
        tags: [
          { id: crypto.randomUUID(), name: "Participation", color: "#F59E0B" },
        ] as Tag[],
      },
      {
        title: "Lab Report Grading",
        tags: [
          { id: crypto.randomUUID(), name: "Lab", color: "#8B5CF6" },
          { id: crypto.randomUUID(), name: "Technical", color: "#EC4899" },
        ] as Tag[],
      },
      {
        title: "Presentation Feedback",
        tags: [
          { id: crypto.randomUUID(), name: "Presentation", color: "#6366F1" },
        ] as Tag[],
      },
    ];

    console.log("starterTemplates", starterTemplates);

    const newTemplates = starterTemplates.map(({ title, tags }) => {
      const temp = createTemplate();
      const criterion = createCriterion();
      temp.title = title;
      temp.tags = tags;
      temp.createdAt = new Date();
      temp.lastUsed = "Never";
      temp.key = crypto.randomUUID();
      temp.usageCount = 0;
      criterion.description = "This is a test description";
      criterion.longDescription = "This is a test long description";
      criterion.id = 1;
      criterion.templateTitle = title;
      criterion.template = temp.key;
      temp.criteria = [criterion];
      return temp;
    });

    setModal({
      isOpen: true,
      title: "Create Starter Templates",
      message: `This will create ${starterTemplates.length} template(s) with predefined tags. Would you like to proceed?`,
      choices: [
        {
          label: "Create Templates",
          action: () => {
            void (async () => {
              try {
                // Create templates one at a time
                for (const temp of newTemplates) {
                  // Update newTemplate state and use the existing postTemplate
                  setNewTemplate(temp);
                  if (newTemplate.title !== "") {
                    const response = await postTemplate();
                    if (!response.success) {
                      throw new Error(
                        `Failed to create template: ${temp.title}`
                      );
                    } else {
                      console.log("response from batch create", response.data);
                    }
                  }
                }
                // Rest of the success handling...
                const response = await getAllTemplates();
                if (response.success) {
                  setTemplates(response.data as Template[]);

                  // Add the new tags to availableTags if they don't exist
                  const newTags = newTemplates.flatMap((t) => t.tags);
                  setAvailableTags((prev) => {
                    const existingIds = new Set(prev.map((t) => t.id));
                    const uniqueNewTags = newTags.filter(
                      (t) => !existingIds.has(t.id)
                    );
                    return [...prev, ...uniqueNewTags];
                  });

                  setPopUp({
                    isOpen: true,
                    title: "Success",
                    message: `Successfully created ${newTemplates.length} starter templates!`,
                  });
                }
                closeModal();
              } catch (error) {
                console.error("Error creating starter templates:", error);
                setPopUp({
                  isOpen: true,
                  title: "Error",
                  message:
                    "Failed to create some starter templates. Please try again.",
                });
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

  const handleUpdateSelectedTemplates = (templateKey: string) => {
    setSelectedTemplates((prev) =>
      prev.includes(templateKey)
        ? prev.filter((key) => key !== templateKey)
        : [...prev, templateKey]
    );
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
          action: async () => {
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
              const response = await getAllTemplates();
              if (response.success) {
                setTemplates(response.data as Template[]);
                setSelectedTemplates([]);
              }
              closeModal();
            } catch (error) {
              console.error("Error during bulk delete:", error);
            }
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

  // Update renderUserTemplates to use the new search component
  const renderTemplatesContent = () => {
    if (!templates) return;

    return (
      <div className="mt-0 p-10 gap-6 w-full">
        <div className="flex justify-between items-center mb-4">
          <p className="text-white text-2xl font-bold text-center">
            View, Edit, and Create templates here!
          </p>
        </div>

        {/* Search Bar */}
        <TemplateSearch
          templates={templates}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
        />

        {/* Add tag filters */}
        <AddTemplateTag
          availableTags={availableTags}
          selectedTagFilters={selectedTagFilters}
          setSelectedTagFilters={setSelectedTagFilters}
          templates={templates}
          setTagModalOpen={setTagModalOpen}
        />

        {/* Templates Container */}
        <TemplatesWindow
          templates={templates}
          searchQuery={searchQuery}
          selectedTemplates={selectedTemplates}
          focusedTemplateKey={focusedTemplateKey}
          selectedTagFilters={selectedTagFilters}
          handleUpdateTemplate={handleUpdateTemplate}
          handleRemoveTemplate={handleRemoveTemplate}
          handleSubmitTemplate={handleSubmitTemplate}
          setSelectedTagFilters={setSelectedTagFilters}
          setFocusedTemplateKey={setFocusedTemplateKey}
          handleDuplicateTemplate={handleDuplicateTemplate}
          sortConfig={sortConfig}
          setSelectedTemplates={handleUpdateSelectedTemplates}
          bulkDeleteHandler={handleBulkDelete}
          sorter={
            <TemplateSorter
              sortConfig={sortConfig}
              setSortConfig={setSortConfig}
            />
          }
        />
      </div>
    );
  };

  const renderNoTemplates = () => {
    return (
      <div className="mt-0 p-10 gap-6 w-full">
        <p className="text-white text-2xl font-bold mb-4 text-center">
          View, Edit, and Create templates here!
        </p>
        <p className="text-gray-300 text-2xl font-bold mb-4">
          No templates found. Create a template to get started!
        </p>
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div className="min-h-screen pt-16">
        <Navbar />

        {templates.length > 0 ? renderTemplatesContent() : renderNoTemplates()}

        <div className="mx-10 rounded-lg flex flex-row">
          <button
            onClick={() => void handleCreateTemplate()}
            className="bg-blue-500 text-white font-bold rounded-lg py-2 px-4 mr-4 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Template
          </button>
          <button
            onClick={() => void handleBatchCreateTemplate()}
            className="bg-blue-500 text-white font-bold rounded-lg py-2 px-4 mr-4 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Batch Create
          </button>
        </div>

        <ModalChoiceDialog
          show={modal.isOpen}
          onHide={closeModal}
          title={modal.title}
          message={modal.message}
          choices={modal.choices}
        />
        <PopUp
          show={popUp.isOpen}
          onHide={closePopUp}
          title={popUp.title}
          message={popUp.message}
        />
      </div>
    );
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
              template={newTemplate}
              updateTemplateHandler={handleUpdateTemplate}
              removeTemplate={handleRemoveTemplate}
              isNewTemplate={true}
              submitTemplateHandler={handleSubmitTemplate}
              existingTemplates={templates}
              layoutStyle={"list"}
              templateFocused={focusedTemplateKey === newTemplate.key}
              onTemplateFocusedToggle={() =>
                setFocusedTemplateKey(
                  focusedTemplateKey === newTemplate.key
                    ? null
                    : newTemplate.key
                )
              }
              isSelected={selectedTemplates.includes(newTemplate.key)}
              duplicateTemplate={handleDuplicateTemplate}
              viewOrEdit="edit"
            />
          }
        />
      )}
      <MainPageTemplate
        children={
          <>
            {renderContent()}
            {renderTagModal()}
          </>
        }
      />
    </>
  );
}
