import React, { useCallback, useEffect, useState } from "react";
import TemplateCard from "../templatesPage/TemplateCards.tsx";
import { Template } from "palette-types";
import TemplateManagementControls from "./TemplateManagementControls.tsx";
import { useTemplatesContext } from "./TemplateContext.tsx";
import TemplateSorter from "./TemplateSorter.tsx";
import { Choice, ChoiceDialog } from "@components";

const TemplatesWindow = () => {
  const {
    templates,
    selectedTemplates,
    setSelectedTemplates,
    searchQuery,
    selectedTagFilters,
    sortConfig,
    layoutStyle,
    showBulkActions,
    setShowBulkActions,
    selectAll,
    setSelectAll,
    setDeletingTemplates,
    handleBulkDeleteTemplates,
  } = useTemplatesContext();

  useEffect(() => {
    console.log("templates window rendered");
  }, []);

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    choices: [] as Choice[],
  });

  const closeModal = useCallback(
    () => setModal((prevModal) => ({ ...prevModal, isOpen: false })),
    [],
  );

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    if (newSelectAll) {
      // Select all templates
      const allTemplateKeys = templates.map((template) => template.key);
      setSelectedTemplates(allTemplateKeys);
    } else {
      // Deselect all templates
      setSelectedTemplates([]);
    }
    setShowBulkActions(true);
  };

  const handleBulkDelete = () => {
    // console.log("selectedTemplates in handleBulkDelete", selectedTemplates);
    setModal({
      isOpen: true,
      title: "Confirm Bulk Delete",
      message: `Are you sure you want to delete ${selectedTemplates.length} templates? This action cannot be undone.`,
      choices: [
        {
          autoFocus: true,
          label: "Delete All Selected",
          action: () => {
            setDeletingTemplates(
              selectedTemplates.map(
                (key) => templates.find((t) => t.key === key) as Template,
              ),
            );
            console.log(
              "selectedTemplates in handleBulkDelete",
              selectedTemplates,
            );
            handleBulkDeleteTemplates();
            closeModal();
          },
        },
        {
          label: "Cancel",
          action: closeModal,
          autoFocus: false,
        },
      ],
    });
    setShowBulkActions(false);
  };

  const handleBulkExport = () => {
    const selectedTemplatesToExport = templates.filter((t) =>
      selectedTemplates.includes(t.key),
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
                  onClick={handleBulkDelete}
                  className="px-2 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2"
                >
                  <i className="fas fa-trash-alt" />
                  Delete Selected ({selectedTemplates.length})
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
          selectedTagFilters.every((tagKey) =>
            template.tags.some((tag) => tag.key === tagKey),
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
          case "usageCount":
            return (a.usageCount - b.usageCount) * direction;
          default:
            return 0;
        }
      });
  }, [templates, searchQuery, selectedTagFilters, sortConfig]);

  const handleSelectTemplateBulkActions = (templateKey: string) => {
    if (selectedTemplates.includes(templateKey)) {
      const newSelected = selectedTemplates.filter(
        (key) => key !== templateKey,
      );

      setSelectedTemplates(newSelected);
    } else {
      const newSelected = [...selectedTemplates, templateKey];
      setSelectedTemplates(newSelected);
    }
    setSelectAll(false);
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
                <TemplateCard template={template} />
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
    <>
      <div className="flex flex-col">
        <div className="flex justify-between mb-4">
          <div>{showBulkActions && renderBulkActions()}</div>
          <div className="ml-auto flex items-center gap-4">
            <TemplateManagementControls />
            <TemplateSorter />
          </div>
        </div>
        {renderAllTemplates()}
      </div>
      <ChoiceDialog
        show={modal.isOpen}
        onHide={closeModal}
        title={modal.title}
        message={modal.message}
        choices={modal.choices}
        excludeCancel={false}
      />
    </>
  );
};
export default TemplatesWindow;
