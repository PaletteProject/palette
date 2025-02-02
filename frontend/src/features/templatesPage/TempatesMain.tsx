/**
 * Rubric Builder view.
 */

import { ReactElement, useCallback, useState } from "react";
import { MainPageTemplate, ModalChoiceDialog, PopUp } from "@components";
import { TemplateProvider, useTemplatesContext } from "./TemplateContext.tsx";
import { EditModalProvider, useEditModal } from "./EditModalProvider.tsx";
import TemplatesWindow from "./TemplatesWindow.tsx";
import TemplateSearch from "./TemplateSearch.tsx";

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
    handleQuickStart,
  } = useTemplatesContext();
  const { setIsEditModalOpen } = useEditModal();

  const [popUp, setPopUp] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    choices: [] as { label: string; action: () => void }[],
  });

  const closeModal = useCallback(
    () => setModal((prevModal) => ({ ...prevModal, isOpen: false })),
    []
  );

  const closePopUp = useCallback(
    () => setPopUp((prevPopUp) => ({ ...prevPopUp, isOpen: false })),
    []
  );

  const createTemplate = () => {
    console.log("createTemplate");
    setIsEditModalOpen(true);
    handleCreateTemplate();
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
            onClick={() => void createTemplate()}
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

  return <MainPageTemplate children={renderContent()} />;
}
