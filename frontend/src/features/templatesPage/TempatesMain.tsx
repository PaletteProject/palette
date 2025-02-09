/**
 * Rubric Builder view.
 */

import { ReactElement, useCallback, useEffect, useState } from "react";
import { Choice, Dialog, MainPageTemplate } from "@components";
import { TemplateProvider, useTemplatesContext } from "./TemplateContext.tsx";
import TemplatesWindow from "./TemplatesWindow.tsx";
import TemplateSearch from "./TemplateSearch.tsx";
import AddTemplateTag from "./AddTemplateTag.tsx";
import { GenericBuilder } from "src/components/layout/GenericBuilder.tsx";
import { Template } from "palette-types";
import { ChoiceDialog } from "src/components/modals/ChoiceDialog.tsx";

export default function TemplatesMain(): ReactElement {
  return (
    <TemplateProvider>
      <TemplatesMainContent />
    </TemplateProvider>
  );
}

function TemplatesMainContent(): ReactElement {
  const {
    templates,
    searchQuery,
    setSearchQuery,
    showSuggestions,
    setShowSuggestions,
    handleCreateTemplate,
    handleSubmitNewTemplate,
    handleQuickStart,
    setIsNewTemplate,
    setShowBulkActions,
    editingTemplate,
    setEditingTemplate,
    hasUnsavedChanges,
  } = useTemplatesContext();

  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const closeModal = useCallback(
    () => setModal((prevModal) => ({ ...prevModal, isOpen: false })),
    [],
  );

  // object containing related modal state
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    choices: [] as Choice[],
  });

  useEffect(() => {
    console.log("editingTemplate in TemplatesMain", editingTemplate);
    setEditingTemplate(editingTemplate as Template);
  }, [templateDialogOpen]);

  const handleCloseModal = () => {
    if (hasUnsavedChanges) {
      setModal({
        isOpen: true,
        title: "Lose unsaved changes? Template main",
        message:
          "Are you sure you want to leave without saving your changes? Your changes will be lost.",
        choices: [
          {
            label: "Yes",
            action: () => {
              closeModal();
              setTemplateDialogOpen(false);
            },
            autoFocus: true,
          },
        ],
      });
    } else {
      setTemplateDialogOpen(false);
    }
  };

  const handleCreateNewTemplate = () => {
    console.log("createTemplate");
    setTemplateDialogOpen(true);
    handleCreateTemplate();
  };

  const handleTemplateSubmit = () => {
    // setTemplateDialogOpen(false);
    console.log("handleNewTemplateSubmit");
    handleSubmitNewTemplate();
    setIsNewTemplate(false);
    setShowBulkActions(false);
    setTemplateDialogOpen(false);
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
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          onSearch={setSearchQuery}
        />
        <p className="text-gray-400 text-sm mb-2">
          Only tags with templates are shown here. Click gear icon to see all
          tags!
        </p>
        {/* Add tag filters */}
        <AddTemplateTag />

        {/* Templates Container */}
        <TemplatesWindow />
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
        {templates && templates.length > 0
          ? renderTemplatesContent()
          : renderNoTemplates()}

        <div className="mx-10 rounded-lg flex flex-row">
          <button
            onClick={() => void handleCreateNewTemplate()}
            className="bg-blue-500 text-white font-bold mb-6 rounded-lg py-2 px-4 mr-4 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Template
          </button>
          {templates.length === 0 && (
            <button
              onClick={() => void handleQuickStart()}
              className="bg-blue-500 text-white font-bold mb-6 rounded-lg py-2 px-4 mr-4 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Quick Start
            </button>
          )}
        </div>

        {/* <TemplateMetrics /> */}

        <Dialog
          isOpen={templateDialogOpen}
          onClose={handleCloseModal}
          title={""}
          children={
            <GenericBuilder
              builderType="template"
              document={editingTemplate as Template}
              setDocument={(template) =>
                setEditingTemplate(template as Template)
              }
              onSubmit={handleTemplateSubmit}
            />
          }
        />
        {/* ModalChoiceDialog */}
        <ChoiceDialog
          show={modal.isOpen}
          onHide={closeModal}
          title={modal.title}
          message={modal.message}
          choices={modal.choices}
          excludeCancel={false}
        />
      </div>
    );
  };

  return <MainPageTemplate children={renderContent()} />;
}
