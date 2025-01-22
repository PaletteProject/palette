/**
 * Rubric Builder view.
 */

import { ReactElement, useCallback, useEffect, useState } from "react";
import {
  Dialog,
  ModalChoiceDialog,
  PopUp,
  EditTemplateModal,
} from "@components";
import { createRubric } from "@utils";
import { Criteria, Rubric, Template } from "palette-types";
import { useCourse } from "../../context/index.ts";
import { useAssignment } from "../../context/AssignmentProvider.tsx";
import TemplateUpload from "../rubricBuilder/TemplateUpload.tsx";
import TemplateCard from "./TemplateCards.tsx";
import { useFetch } from "@hooks";

export default function TemplatesPage(): ReactElement {
  /**
   * Rubric Builder State
   */

  // active rubric being edited
  const [rubric, setRubric] = useState<Rubric | undefined>(undefined);

  // tracks which criterion card is displaying the detailed view (limited to one at a time)
  const [activeTemplateIndex, setActiveTemplateIndex] = useState(-1);

  const [templateInputActive, setTemplateInputActive] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

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

  /**
   * Active Course and Assignment State (Context)
   */
  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();

  /**
   * Effect hook to see if the active assignment has an existing rubric. Apply loading status while waiting to
   * determine which view to render.
   */
  useEffect(() => {
    (async () => {
      const response = await getAllTemplates();
      if (response.success) {
        setTemplates(response.data as Template[]);
      }
    })().catch((error) => {
      console.error("Failed to fetch templates:", error);
    });

    if (!activeCourse) {
      console.warn("Select a course before trying to fetch rubric");
      return;
    }

    if (!activeAssignment) {
      console.warn("Select a assignment before trying to fetch rubric");
      return;
    }
  }, [activeCourse, activeAssignment]);

  const handleImportTemplate = (template: Template) => {
    console.log("import template");
    if (!rubric) return;

    const currentCriteria = rubric.criteria;
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

  /**
   * Effect to load a default rubric if canvas api is bypassed
   */
  useEffect(() => {}, [rubric]);

  const handleRemoveTemplate = (index: number) => {
    if (!rubric) return;
    const newTemplates = [...templates];
    newTemplates.splice(index, 1);
    setTemplates(newTemplates);
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
        <p className="text-white text-2xl font-bold mb-4">Templates</p>
        <p className="text-white font-bold mb-4">
          View and edit existing templates and create new templates here!
        </p>

        <div className="flex flex-col max-h-[500px] bg-red-500 rounded-lg overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800">
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

  /**
   * Helper function to consolidate conditional rendering in the JSX.
   */

  return (
    <div className="min-h-screen h-auto flex flex-col w-full bg-gradient-to-b from-gray-900 to-gray-700 text-white font-sans">
      {renderUserTemplates()}

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
