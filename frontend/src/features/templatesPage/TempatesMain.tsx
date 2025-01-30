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
import { Template } from "palette-types";
import TemplateCard from "./TemplateCards.tsx";
import { useFetch } from "@hooks";
import { createTemplate } from "src/utils/templateFactory.ts";

// Add new types and interfaces
type Tag = {
  id: string;
  name: string;
  color: string;
};

export default function TemplatesMain(): ReactElement {
  // tracks which criterion card is displaying the detailed view (limited to one at a time)
  const [activeTemplateIndex, setActiveTemplateIndex] = useState(-1);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [newTemplate, setNewTemplate] = useState<Template>(createTemplate());
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Add new state for search
  const [searchQuery, setSearchQuery] = useState("");

  // Add new state for view mode
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Add new state for quick edit mode
  const [focusedTemplateKey, setFocusedTemplateKey] = useState<string | null>(
    null
  );

  // Add new state for sorting
  const [sortConfig, setSortConfig] = useState<{
    key: "title" | "dateCreated" | "lastModified";
    direction: "asc" | "desc";
  }>({ key: "title", direction: "asc" });

  // Add new state for selected templates
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Add new state for bulk actions visibility
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Add new states for tags
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);

  // Add state for tag creation modal
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [newTag, setNewTag] = useState<Partial<Tag>>({
    name: "",
    color: "#3B82F6", // default blue color
  });

  // Predefined colors for tags
  const tagColors = [
    "#3B82F6", // blue
    "#EF4444", // red
    "#10B981", // green
    "#F59E0B", // yellow
    "#8B5CF6", // purple
    "#EC4899", // pink
    "#6366F1", // indigo
    "#14B8A6", // teal
  ];

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

  useEffect(() => {
    (async () => {
      const response = await getAllTemplates();
      if (response.success) {
        setTemplates(response.data as Template[]);
      }
    })().catch((error) => {
      console.error("Failed to fetch templates:", error);
    });
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
    const currentDate = new Date(); // Create actual Date object
    newTemplate.createdAt = currentDate;
    newTemplate.lastUsed = "Never";
    setNewTemplate(newTemplate);
    setIsEditModalOpen(true);
  };

  const handleDuplicateTemplate = (template: Template) => {
    const duplicatedTemplate = { ...template, key: crypto.randomUUID() };
    setTemplates([...templates, duplicatedTemplate]);
  };

  const renderNewTemplate = () => {
    if (!isEditModalOpen) return;
    console.log("template length!!", templates.length);
    return (
      <TemplateCard
        index={templates.length}
        activeTemplateIndex={templates.length}
        template={newTemplate}
        updateTemplateHandler={handleUpdateTemplate}
        removeTemplate={handleRemoveTemplate}
        activeTemplateIndexHandler={setActiveTemplateIndex}
        isNewTemplate={true}
        submitTemplateHandler={handleSubmitTemplate}
        existingTemplates={templates}
        viewMode={viewMode}
        templateFocused={focusedTemplateKey === newTemplate.key}
        onTemplateFocusedToggle={() =>
          setFocusedTemplateKey(
            focusedTemplateKey === newTemplate.key ? null : newTemplate.key
          )
        }
        isSelected={selectedTemplates.includes(newTemplate.key)}
        duplicateTemplate={handleDuplicateTemplate}
      />
    );
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

  // Add this sorting function before the renderUserTemplates function
  const getSortedTemplates = (templatesToSort: Template[]) => {
    return [...templatesToSort].sort((a, b) => {
      switch (sortConfig.key) {
        case "title":
          const comparison = a.title.localeCompare(b.title);
          return sortConfig.direction === "asc" ? comparison : -comparison;
        case "dateCreated":
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        case "lastModified":
          const modifiedA = new Date(a.lastUsed).getTime();
          const modifiedB = new Date(b.lastUsed).getTime();
          return sortConfig.direction === "asc"
            ? modifiedA - modifiedB
            : modifiedB - modifiedA;
        default:
          return 0;
      }
    });
  };

  // Modified filteredTemplates to include tag filtering
  const filteredTemplates = useCallback(() => {
    let filtered = templates;

    // Text search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.title.toLowerCase().includes(query) ||
          template.criteria.some((criterion) =>
            criterion.templateTitle?.toLowerCase().includes(query)
          ) ||
          template.tags.some((tag) => tag.name.toLowerCase().includes(query))
      );
    }

    // Tag filter
    if (selectedTagFilters.length > 0) {
      filtered = filtered.filter((template) =>
        selectedTagFilters.every((tagId) =>
          template.tags.some((tag) => tag.id === tagId)
        )
      );
    }

    return getSortedTemplates(filtered);
  }, [templates, searchQuery, sortConfig, selectedTagFilters]);

  const handleSelectTemplate = (templateKey: string) => {
    setSelectedTemplates((prev) =>
      prev.includes(templateKey)
        ? prev.filter((key) => key !== templateKey)
        : [...prev, templateKey]
    );
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedTemplates(!selectAll ? templates.map((t) => t.key) : []);
  };

  const handleBulkDelete = () => {
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
                setSelectAll(false);
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

  const handleBulkExport = () => {
    const selectedTemplatesToExport = templates.filter((t) =>
      selectedTemplates.includes(t.key)
    );

    const exportData = JSON.stringify(selectedTemplatesToExport, null, 2);
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "exported-templates.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderBulkActions = () => {
    return (
      <div className="flex justify-between items-center h-12 mb-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center text-white min-w-[100px]">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="mr-2 h-4 w-4"
            />
            Select All
          </label>
          <div className="flex gap-2">
            {selectedTemplates.length > 0 && (
              <>
                <button
                  onClick={handleBulkDelete}
                  className="px-2 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2"
                >
                  <i className="fas fa-trash-alt" />
                  Delete Selected ({
                    selectedTemplates.length
                  })
                </button>
                <button
                  onClick={handleBulkExport}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
                >
                  <i className="fas fa-file-export" />
                  Export Selected
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTopRightPageButtons = () => {
    return (
      <div className="flex items-center gap-4">
        {/* Add bulk actions toggle button */}
        <button
          onClick={() => setShowBulkActions(!showBulkActions)}
          className={`px-4 py-2 rounded-lg focus:outline-none  ${
            showBulkActions
              ? "bg-gray-700 text-white focus:ring-blue-500 focus:ring-2"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          <i className="fas fa-tasks mr-2" /> Bulk Actions
        </button>

        {/* View Toggle Buttons */}
        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={viewMode === "grid"}
              onChange={() =>
                setViewMode(viewMode === "list" ? "grid" : "list")
              }
            />
            <div className="w-[120px] h-8 bg-gray-700 rounded-full peer peer-checked:after:translate-x-[60px] after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-[56px] after:transition-all">
              <div className="flex justify-between items-center h-full px-2 text-sm">
                <span
                  className={`${viewMode === "list" ? "text-white" : "text-gray-400"}`}
                >
                  <i className="fas fa-list mr-1" /> List
                </span>
                <span
                  className={`${viewMode === "grid" ? "text-white" : "text-gray-400"}`}
                >
                  <i className="fas fa-grid-2 mr-1" /> Grid
                </span>
              </div>
            </div>
          </label>
        </div>

        {/* Sorting Selector */}
        <select
          className="bg-gray-700 text-white px-3 py-2 rounded-lg"
          value={`${sortConfig.key}-${sortConfig.direction}`}
          onChange={(e) => {
            const [key, direction] = e.target.value.split("-");
            setSortConfig({
              key: key as typeof sortConfig.key,
              direction: direction as "asc" | "desc",
            });
          }}
        >
          {/* Sorting Options */}
          <option value="title-asc">Title (A-Z)</option>
          <option value="title-desc">Title (Z-A)</option>
          <option value="dateCreated-desc">Newest First</option>
          <option value="dateCreated-asc">Oldest First</option>
        </select>
      </div>
    );
  };

  // Add tag management functions
  const handleCreateTag = () => {
    if (!newTag.name) return;

    const tag: Tag = {
      id: crypto.randomUUID(),
      name: newTag.name,
      color: newTag.color || tagColors[0],
    };

    setAvailableTags((prev) => [...prev, tag]);
    setNewTag({ name: "", color: "#3B82F6" });
    setIsTagModalOpen(false);
  };

  const handleAddTagToTemplate = (templateKey: string, tagId: string) => {
    setTemplates((prev) =>
      prev.map((template) => {
        if (template.key === templateKey) {
          const tag = availableTags.find((t) => t.id === tagId);
          if (tag && !template.tags.some((t) => t.id === tagId)) {
            return {
              ...template,
              tags: [...template.tags, tag],
            };
          }
        }
        return template;
      })
    );
  };

  const handleRemoveTagFromTemplate = (templateKey: string, tagId: string) => {
    setTemplates((prev) =>
      prev.map((template) => {
        if (template.key === templateKey) {
          return {
            ...template,
            tags: template.tags.filter((tag) => tag.id !== tagId),
          };
        }
        return template;
      })
    );
  };

  // Add tag filter component
  const renderTagFilters = () => {
    return (
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <span className="text-white">Filter by tags:</span>
        {availableTags.map((tag) => (
          <button
            key={tag.id}
            onClick={() =>
              setSelectedTagFilters((prev) =>
                prev.includes(tag.id)
                  ? prev.filter((id) => id !== tag.id)
                  : [...prev, tag.id]
              )
            }
            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1
              ${
                selectedTagFilters.includes(tag.id)
                  ? "ring-2 ring-white"
                  : "opacity-70 hover:opacity-100"
              }`}
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <span className="text-xs">
              (
              {
                templates.filter((t) =>
                  t.tags.some((tTag) => tTag.id === tag.id)
                ).length
              }
              )
            </span>
          </button>
        ))}
        <button
          onClick={() => setIsTagModalOpen(true)}
          className="px-3 py-1 rounded-full text-sm bg-gray-700 text-white hover:bg-gray-600"
        >
          + New Tag
        </button>
      </div>
    );
  };

  // Add tag modal component
  const renderTagModal = () => {
    return (
      <PopUp
        show={isTagModalOpen}
        onHide={() => setIsTagModalOpen(false)}
        title="Create New Tag"
      >
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-white mb-2">Tag Name</label>
            <input
              type="text"
              value={newTag.name}
              onChange={(e) =>
                setNewTag((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 bg-gray-700 text-white rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Tag Color</label>
            <div className="flex gap-2 flex-wrap">
              {tagColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewTag((prev) => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full ${
                    newTag.color === color ? "ring-2 ring-white" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsTagModalOpen(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTag}
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={!newTag.name}
            >
              Create Tag
            </button>
          </div>
        </div>
      </PopUp>
    );
  };

  // Modify renderUserTemplates to use filtered templates
  const renderUserTemplates = () => {
    if (!templates) return;
    const filtered = filteredTemplates();

    return (
      <div className="mt-0 p-10 gap-6 w-full">
        <div className="flex justify-between items-center mb-4">
          <p className="text-white text-2xl font-bold text-center">
            View, Edit, and Create templates here!
          </p>

          {renderTopRightPageButtons()}
        </div>

        {/* Search input (existing code) */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Add tag filters */}
        {renderTagFilters()}
        {renderTagModal()}

        {/* Conditionally render bulk actions -- Select all button and delete/export buttons */}
        {showBulkActions && renderBulkActions()}

        {/* Templates Container */}
        <div
          className={`
          ${
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col"
          }
          max-h-[500px] bg-gray-600 border-2 border-black rounded-lg overflow-auto 
          scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800 p-4
        `}
        >
          {filtered.length > 0 ? (
            filtered.map((template, index) => (
              <div
                key={template.key}
                className={viewMode === "grid" ? "" : "mb-4"}
              >
                <div className="flex items-center gap-2">
                  {showBulkActions && (
                    <input
                      type="checkbox"
                      checked={selectedTemplates.includes(template.key)}
                      onChange={() => handleSelectTemplate(template.key)}
                      className="h-4 w-4"
                    />
                  )}
                  <TemplateCard
                    index={index}
                    activeTemplateIndex={activeTemplateIndex}
                    template={template}
                    updateTemplateHandler={handleUpdateTemplate}
                    removeTemplate={handleRemoveTemplate}
                    activeTemplateIndexHandler={setActiveTemplateIndex}
                    isNewTemplate={false}
                    submitTemplateHandler={handleSubmitTemplate}
                    existingTemplates={templates}
                    viewMode={viewMode}
                    templateFocused={focusedTemplateKey === template.key}
                    onTemplateFocusedToggle={() =>
                      setFocusedTemplateKey(
                        focusedTemplateKey === template.key
                          ? null
                          : template.key
                      )
                    }
                    isSelected={selectedTemplates.includes(template.key)}
                    duplicateTemplate={handleDuplicateTemplate}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-white text-center p-4">
              No templates found matching your search.
            </p>
          )}
        </div>
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

        {templates.length > 0 ? renderUserTemplates() : renderNoTemplates()}

        <div className="mx-10 rounded-lg flex flex-row">
          <button
            onClick={handleCreateTemplate}
            className="bg-blue-500 text-white font-bold rounded-lg py-2 px-4 mr-4 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Template
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
        <EditTemplateModal
          onClose={() => setIsEditModalOpen(false)}
          children={renderNewTemplate()}
          isOpen={isEditModalOpen}
        />
      </div>
    );
  };

  /**
   * Helper function to consolidate conditional rendering in the JSX.
   */

  return <MainPageTemplate children={renderContent()} />;
}
