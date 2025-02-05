/**
 * Rubric Builder view.
 */

import { ReactElement, useState } from "react";
import { Dialog, MainPageTemplate } from "@components";
import { TemplateProvider, useTemplatesContext } from "./TemplateContext.tsx";
import { EditModalProvider } from "./EditModalProvider.tsx";
import TemplatesWindow from "./TemplatesWindow.tsx";
import TemplateSearch from "./TemplateSearch.tsx";
import AddTemplateTag from "./AddTemplateTag.tsx";
import { GenericBuilder } from "src/components/layout/GenericBuilder.tsx";
import { Template } from "palette-types";

export default function TemplatesMain(): ReactElement {
  return (
    <TemplateProvider>
      <EditModalProvider>
        <TemplatesMainContent />
      </EditModalProvider>
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
  } = useTemplatesContext();

  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const handleCloseModal = () => {
    setTemplateDialogOpen(false);
  };

  const handleCreateNewTemplate = () => {
    console.log("createTemplate");
    setTemplateDialogOpen(true);
    handleCreateTemplate();
  };

  const handleNewTemplateSubmit = () => {
    // setTemplateDialogOpen(false);
    console.log("handleNewTemplateSubmit");
    handleSubmitNewTemplate();
    setIsNewTemplate(false);
    setShowBulkActions(false);
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
            className="bg-blue-500 text-white font-bold rounded-lg py-2 px-4 mr-4 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Template
          </button>
          {templates.length === 0 && (
            <button
              onClick={() => void handleQuickStart()}
              className="bg-blue-500 text-white font-bold rounded-lg py-2 px-4 mr-4 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Quick Start
            </button>
          )}
        </div>

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
              onSubmit={handleNewTemplateSubmit}
            />
          }
        />
      </div>
    );
  };

  return <MainPageTemplate children={renderContent()} />;
}
