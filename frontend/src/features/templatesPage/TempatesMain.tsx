/**
 * Rubric Builder view.
 */

import { ReactElement, useCallback, useEffect, useState } from "react";
import {
  Dialog,
  ModalChoiceDialog,
  PopUp,
  EditTemplateModal,
  Navbar,
} from "@components";
import { createRubric } from "@utils";
import { Criteria, Rubric, Template } from "palette-types";
import TemplateUpload from "../rubricBuilder/TemplateUpload.tsx";
import TemplateCard from "./TemplateCards.tsx";
import { useFetch } from "@hooks";
import { createTemplate } from "src/utils/templateFactory.ts";
import { TemplateService } from "../../../../backend/src/TemplatesAPI/templateRequests.ts";

export default function TemplatesMain(): ReactElement {
  /**
   * Rubric Builder State
   */

  // active rubric being edited
  const [rubric, setRubric] = useState<Rubric | undefined>(undefined);

  // tracks which criterion card is displaying the detailed view (limited to one at a time)
  const [activeTemplateIndex, setActiveTemplateIndex] = useState(-1);

  const [templateInputActive, setTemplateInputActive] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [newTemplate, setNewTemplate] = useState<Template>(createTemplate());
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
      const deleteTemplate = async () => {
        const response = await fetchData();
        console.log("delete response", response);
        if (response.success) {
          const newTemplates = templates.filter(
            (t) => t.key !== deletingTemplate.key
          );
          setTemplates(newTemplates);
          setDeletingTemplate(null);
        }
      };
      deleteTemplate();
    }
  }, [deletingTemplate]);

  const handleImportTemplate = (template: Template) => {
    console.log("import template");
    if (!template) return;

    const currentCriteria = template.criteria;
    const newCriteria = template.criteria;

    if (newCriteria.length === 0) {
      setPopUp({
        isOpen: true,
        title: "Oops!",
        message: `This template has no criteria`,
      });

      return;
    }

    // Split into unique and duplicate criteria
    const { unique, duplicates } = newCriteria.reduce(
      (acc, newCriterion) => {
        const isDuplicate = currentCriteria.some(
          (existingCriterion) =>
            existingCriterion.key.trim().toLowerCase() ===
            newCriterion.key.trim().toLowerCase()
        );

        if (isDuplicate) {
          acc.duplicates.push(newCriterion);
        } else {
          acc.unique.push(newCriterion);
        }

        return acc;
      },
      { unique: [] as Criteria[], duplicates: [] as Criteria[] }
    );

    // Log information about duplicates if any were found
    if (duplicates.length > 0) {
      console.log(
        `Found ${duplicates.length} duplicate criteria that were skipped:`,
        duplicates.map((c) => c.description)
      );
    }

    setRubric(
      (prevRubric) =>
        ({
          ...(prevRubric ?? createRubric()),
          criteria: [...(prevRubric?.criteria ?? []), ...unique],
        }) as Rubric
    );
  };

  const handleCreateTemplate = () => {
    setNewTemplate(createTemplate());
    setIsEditModalOpen(true);
  };

  const renderDetailedView = () => {
    return <div>Detailed View</div>;
  };

  const handleRemoveTemplate = async (index: number) => {
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
    if (!rubric) return;
    const newTemplates = [...templates];
    newTemplates[index] = template;
    setTemplates(newTemplates);
  };

  const renderUserTemplates = () => {
    if (!templates) return;
    return (
      <div className="mt-0 p-10 gap-6 w-full">
        <p className="text-white text-2xl font-bold mb-4 text-center">
          View, Edit, and Create templates here!
        </p>

        <div className="flex flex-col max-h-[500px] bg-red-500 border-2 border-black rounded-lg overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800">
          {templates.map((template, index) => (
            <div key={template.key} className="m-2">
              <TemplateCard
                index={index}
                activeTemplateIndex={activeTemplateIndex}
                template={template}
                handleTemplateUpdate={handleUpdateTemplate}
                removeTemplate={handleRemoveTemplate}
                setActiveTemplateIndex={setActiveTemplateIndex}
              />
            </div>
          ))}
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

  /**
   * Helper function to consolidate conditional rendering in the JSX.
   */

  return (
    <div className="min-h-screen h-auto flex flex-col w-full bg-gradient-to-b from-gray-900 to-gray-700 text-white font-sans">
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
        template={newTemplate}
        onClose={() => setIsEditModalOpen(false)}
        title={newTemplate.title}
        children={renderDetailedView()}
        isOpen={isEditModalOpen}
      />
      <Dialog
        isOpen={templateInputActive}
        onClose={() => setTemplateInputActive(false)}
        title={"Import Template:"}
      >
        <TemplateUpload
          closeImportCard={() => setTemplateInputActive(false)}
          onTemplateSelected={handleImportTemplate}
        />
      </Dialog>
    </div>
  );
}
