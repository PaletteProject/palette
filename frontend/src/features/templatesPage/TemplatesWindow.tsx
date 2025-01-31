import React, { useCallback, useEffect, useState } from "react";
import TemplateCard from "../templatesPage/TemplateCards.tsx";
import { Template } from "palette-types";
import TemplateManagementControls from "./TemplateManagementControls.tsx";

interface TemplatesWindowProps {
  templates: Template[];
  newTemplate: Template;
  searchQuery: string;
  isEditModalOpen: boolean;
  selectedTemplates: string[];
  focusedTemplateKey: string | null;
  selectedTagFilters: string[];
  creatingNewTemplate: boolean;
  setSearchQuery: (searchQuery: string) => void;
  handleUpdateTemplate: (index: number, template: Template) => void;
  handleRemoveTemplate: (index: number) => void;
  handleSubmitTemplate: () => void;
  setSelectedTagFilters: (selectedTagFilters: string[]) => void;
  setFocusedTemplateKey: (focusedTemplateKey: string | null) => void;
  setActiveTemplateIndex: (index: number) => void;
  handleDuplicateTemplate: (template: Template) => void;
  deletingTemplate: Template | null;
  setDeletingTemplate: (template: Template | null) => void;
  setSelectedTemplates: (templateKey: string) => void;
  bulkDeleteHandler: () => void;
  sortConfig: {
    key: "title" | "dateCreated" | "lastModified";
    direction: "asc" | "desc";
  };
  setSortConfig: React.Dispatch<
    React.SetStateAction<{
      key: "title" | "dateCreated" | "lastModified";
      direction: "asc" | "desc";
    }>
  >;
}

const TemplatesWindow = ({
  templates,
  newTemplate,
  searchQuery,
  isEditModalOpen,
  selectedTemplates,
  focusedTemplateKey,
  selectedTagFilters,
  creatingNewTemplate,
  setSearchQuery,
  handleUpdateTemplate,
  handleRemoveTemplate,
  handleSubmitTemplate,
  setFocusedTemplateKey,
  setActiveTemplateIndex,
  handleDuplicateTemplate,
  sortConfig,
  setSortConfig,
  deletingTemplate,
  setDeletingTemplate,
  setSelectedTemplates,
  bulkDeleteHandler,
}: TemplatesWindowProps) => {
  const [windowTemplates, setWindowTemplates] = useState<Template[]>(templates);
  const [layoutStyle, setLayoutStyle] = useState<"list" | "grid">("list");
  // Add new state for bulk actions
  const [showBulkActions, setShowBulkActions] = useState(false);
  // Add new state for selected templates
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    setWindowTemplates(templates);
  }, [templates]);

  const handleToggleBulkActions = () => {
    setShowBulkActions(!showBulkActions);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    if (newSelectAll) {
      // Select all templates regardless of filters
      templates.forEach((template) => {
        if (!selectedTemplates.includes(template.key)) {
          setSelectedTemplates(template.key);
        }
      });
    } else {
      // Deselect all templates
      selectedTemplates.forEach((key) => setSelectedTemplates(key));
    }
    // Keep bulk actions visible regardless of selection state
    setShowBulkActions(true);
  };

  // object containing related modal state
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    choices: [] as { label: string; action: () => void }[],
  });

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
    setShowBulkActions(false);
  };

  const renderBulkActions = () => {
    return (
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <label className="flex items-center text-white min-w-[100px] mt-2">
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
                  onClick={bulkDeleteHandler}
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

  // Add this sorting function before the renderUserTemplates function
  const getSortedTemplates = (templatesToSort: Template[]) => {
    return [...templatesToSort].sort((a, b) => {
      switch (sortConfig.key) {
        case "title": {
          const comparison = a.title.localeCompare(b.title);
          return sortConfig.direction === "asc" ? comparison : -comparison;
        }
        case "dateCreated": {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }
        case "lastModified": {
          const modifiedA = new Date(a.lastUsed).getTime();
          const modifiedB = new Date(b.lastUsed).getTime();
          return sortConfig.direction === "asc"
            ? modifiedA - modifiedB
            : modifiedB - modifiedA;
        }
        default:
          return 0;
      }
    });
  };

  // Modified filteredTemplates to include tag filtering
  const filteredTemplates = useCallback(() => {
    let filtered = windowTemplates;

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
  }, [windowTemplates, searchQuery, sortConfig, selectedTagFilters]);

  const handleSelectTemplateBulkActions = (templateKey: string) => {
    setSelectedTemplates(templateKey);
    // If a template is being unchecked, also uncheck "Select All"
    if (selectedTemplates.includes(templateKey)) {
      setSelectAll(false);
    }
  };

  const renderAllTemplates = () => {
    const filtered = filteredTemplates();
    return (
      <div
        className={`
          ${
            layoutStyle === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col"
          }
          max-h-[500px] bg-gray-600 border-2 border-black rounded-lg overflow-auto 
          scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800 p-4
        `}
      >
        {filtered.length > 0 ? (
          filtered.map((template: Template, index: number) => (
            <div
              key={template.key}
              className={layoutStyle === "grid" ? "" : "mb-4"}
            >
              <div className="flex items-center gap-2">
                {showBulkActions && (
                  <input
                    type="checkbox"
                    checked={selectedTemplates.includes(template.key)}
                    onChange={() =>
                      handleSelectTemplateBulkActions(template.key)
                    }
                    className="h-4 w-4"
                  />
                )}
                <TemplateCard
                  index={index}
                  template={template}
                  updateTemplateHandler={handleUpdateTemplate}
                  removeTemplate={handleRemoveTemplate}
                  activeTemplateIndexHandler={setActiveTemplateIndex}
                  isNewTemplate={false}
                  submitTemplateHandler={handleSubmitTemplate}
                  existingTemplates={templates}
                  layoutStyle={layoutStyle}
                  templateFocused={focusedTemplateKey === template.key}
                  onTemplateFocusedToggle={() =>
                    setFocusedTemplateKey(
                      focusedTemplateKey === template.key ? null : template.key
                    )
                  }
                  isSelected={selectedTemplates.includes(template.key)}
                  duplicateTemplate={handleDuplicateTemplate}
                  viewOrEdit="view"
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
    );
  };
  return (
    <div className="flex flex-col">
      <div className="flex justify-between mb-4">
        <div>{showBulkActions && renderBulkActions()}</div>
        <div className="ml-auto">
          <TemplateManagementControls
            layoutStyle={layoutStyle}
            applyLayoutStyle={setLayoutStyle}
            showBulkActions={showBulkActions}
            toggleBulkActions={handleToggleBulkActions}
          />
        </div>
      </div>
      {renderAllTemplates()}
    </div>
  );
};

export default TemplatesWindow;
