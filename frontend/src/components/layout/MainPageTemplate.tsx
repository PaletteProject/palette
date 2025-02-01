import { EditTemplateModal, ModalChoiceDialog } from "@components";
import { Navbar } from "@components";
import { PopUp } from "../PopUp";
import { ReactNode, useCallback, useState } from "react";
import AddTemplateTag from "src/features/templatesPage/AddTemplateTag";
import { useTemplatesContext } from "src/features/templatesPage/TemplateContext";
import TemplateSearch from "src/features/templatesPage/TemplateSearch";
import TemplatesWindow from "src/features/templatesPage/TemplatesWindow";
import TemplateSorter from "src/features/templatesPage/TemplateSorter";
import { createTemplate } from "src/utils/templateFactory";
import { useEditModal } from "src/features/templatesPage/EditModalProvider";
import TemplateCard from "src/features/templatesPage/TemplateCards";
export function MainPageTemplate() {
  const { templates, setTemplates, newTemplate, setNewTemplate } =
    useTemplatesContext();
  const { isEditModalOpen, setIsEditModalOpen } = useEditModal();
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

  const handleCreateTemplate = () => {
    const newTemplate = createTemplate();
    const currentDate = new Date();
    newTemplate.createdAt = currentDate;
    newTemplate.lastUsed = "Never";
    setTemplates([...templates, newTemplate]);
    setNewTemplate(newTemplate);
    setIsEditModalOpen(true);
  };

  const handleQuickStart = () => {
    console.log("quick start");
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

        {/* Add tag filters */}

        {/* Templates Container */}
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
        {templates && templates.length > 0
          ? renderTemplatesContent()
          : renderNoTemplates()}

        <div className="mx-10 rounded-lg flex flex-row">
          <button
            onClick={() => void handleCreateTemplate()}
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

  return (
    <>
      <div className="h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-700 text-white font-sans">
        <main
          className={
            "flex-grow overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
          }
        >
          {templates.length > 0 && (
            <div className="flex flex-col gap-4">
              {templates.map((template) => (
                <div key={template.key}>{template.title}</div>
              ))}
            </div>
          )}
          {renderContent()}
        </main>
      </div>
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
    </>
  );
}
