import React, { useCallback, useEffect, useState } from "react";
import TemplateCard from "../templatesPage/TemplateCards.tsx";
import { Template } from "palette-types";
import TemplateManagementControls from "./TemplateManagementControls.tsx";

interface TemplatesWindowProps {
  templates: Template[];
  searchQuery: string;
  selectedTemplates: string[];
  focusedTemplateKey: string | null;
  selectedTagFilters: string[];
  handleUpdateTemplate: (index: number, template: Template) => void;
  handleRemoveTemplate: (index: number) => void;
  handleSubmitTemplate: () => void;
  setSelectedTagFilters: (selectedTagFilters: string[]) => void;
  setFocusedTemplateKey: (focusedTemplateKey: string | null) => void;
  handleDuplicateTemplate: (template: Template) => void;
  setSelectedTemplates: (templateKey: string) => void;
  bulkDeleteHandler: () => void;
  sorter: React.ReactNode;
  sortConfig: {
    key: "title" | "dateCreated" | "lastModified";
    direction: "asc" | "desc";
  };
}

const TemplatesWindow = ({
  templates,
  searchQuery,
  selectedTemplates,
  focusedTemplateKey,
  selectedTagFilters,
  handleUpdateTemplate,
  handleRemoveTemplate,
  handleSubmitTemplate,
  setFocusedTemplateKey,
  handleDuplicateTemplate,
  sortConfig,
  setSelectedTemplates,
  bulkDeleteHandler,
  sorter,
}: TemplatesWindowProps) => {
  const [layoutStyle, setLayoutStyle] = useState<"list" | "grid">("list");
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

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

  const filteredTemplates = useCallback(() => {
    return templates
      .filter((template) => {
        const matchesSearch = template.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesTags =
          selectedTagFilters.length === 0 ||
          selectedTagFilters.every((tagId) =>
            template.tags.some((tag) => tag.id === tagId)
          );
        return matchesSearch && matchesTags;
      })
      .sort((a, b) => {
        const direction = sortConfig.direction === "asc" ? 1 : -1;

        switch (sortConfig.key) {
          case "title":
            return (a.title < b.title ? -1 : 1) * direction;
          case "dateCreated":
            return (
              (new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()) *
              direction
            );
          case "lastModified":
            return (
              (new Date(a.lastUsed).getTime() -
                new Date(b.lastUsed).getTime()) *
              direction
            );
          default:
            return 0;
        }
      });
  }, [templates, searchQuery, selectedTagFilters, sortConfig]);

  const getOriginalIndex = useCallback(
    (template: Template) => {
      return templates.findIndex((t) => t.key === template.key);
    },
    [templates]
  );

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
          filtered.map((template: Template) => (
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
                  index={getOriginalIndex(template)}
                  template={template}
                  updateTemplateHandler={handleUpdateTemplate}
                  removeTemplate={handleRemoveTemplate}
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
        <div className="ml-auto flex items-center gap-4">
          <TemplateManagementControls
            layoutStyle={layoutStyle}
            applyLayoutStyle={setLayoutStyle}
            showBulkActions={showBulkActions}
            toggleBulkActions={handleToggleBulkActions}
          />
          {sorter}
        </div>
      </div>
      {renderAllTemplates()}
    </div>
  );
};

export default TemplatesWindow;
