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

  const { fetchData } = useFetch(`/templates/byKey/${deletingTemplate?.key}`, {
    method: "DELETE",
  });

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
          const response = await fetchData();
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
    setNewTemplate(newTemplate);
    setIsEditModalOpen(true);
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

  // Add a function to filter templates based on search
  const filteredTemplates = useCallback(() => {
    if (!searchQuery.trim()) return templates;

    const query = searchQuery.toLowerCase();
    return templates.filter(
      (template) =>
        template.title.toLowerCase().includes(query) ||
        template.criteria.some((criterion) =>
          criterion.templateTitle?.toLowerCase().includes(query)
        )
    );
  }, [templates, searchQuery]);

  // Modify renderUserTemplates to use filtered templates
  const renderUserTemplates = () => {
    if (!templates) return;
    const filtered = filteredTemplates();

    return (
      <div className="mt-0 p-10 gap-6 w-full">
        <p className="text-white text-2xl font-bold mb-4 text-center">
          View, Edit, and Create templates here!
        </p>

        {/* Add search input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col max-h-[500px] bg-gray-600 border-2 border-black rounded-lg overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800">
          {filtered.length > 0 ? (
            filtered.map((template, index) => (
              <div key={template.key} className="m-2">
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
                />
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
      <div>
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
