/**
 * Rubric Builder view.
 */

import { ReactElement, useCallback, useEffect, useState } from "react";

import { Dialog, Footer, Header, ModalChoiceDialog, PopUp } from "@components";

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { createRubric } from "@utils";
import { Criteria, Rubric, Template } from "palette-types";
import { AnimatePresence, motion } from "framer-motion";
import { useCourse } from "../../context";
import { useAssignment } from "../../context/AssignmentProvider.tsx";
import TemplateUpload from "../rubricBuilder/TemplateUpload.tsx";
import TemplateCard from "./TemplateCards";
import { useFetch } from "@hooks";

export default function RubricBuilder(): ReactElement {
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
    [],
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
    [],
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

  /**
   * Fires when a drag event ends, resorting the rubric criteria.
   * @param event - drag end event
   */
  const handleDragEnd = (event: DragEndEvent) => {
    if (!rubric) return;
    if (event.over) {
      const oldIndex = rubric.criteria.findIndex(
        (criterion) => criterion.key === event.active.id,
      );
      const newIndex = rubric.criteria.findIndex(
        (criterion) => criterion.key === event.over!.id, // assert not null for type safety
      );

      const updatedCriteria = [...rubric.criteria];
      const [movedCriterion] = updatedCriteria.splice(oldIndex, 1);
      updatedCriteria.splice(newIndex, 0, movedCriterion);

      setRubric({ ...rubric, criteria: updatedCriteria });
    }
  };

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
            newCriterion.key.trim().toLowerCase(),
        );

        if (isDuplicate) {
          acc.duplicates.push(newCriterion);
        } else {
          acc.unique.push(newCriterion);
        }

        return acc;
      },
      { unique: [] as Criteria[], duplicates: [] as Criteria[] },
    );

    // Log information about duplicates if any were found
    if (duplicates.length > 0) {
      console.log(
        `Found ${duplicates.length} duplicate criteria that were skipped:`,
        duplicates.map((c) => c.description),
      );
    }

    setRubric(
      (prevRubric) =>
        ({
          ...(prevRubric ?? createRubric()),
          criteria: [...(prevRubric?.criteria ?? []), ...unique],
        }) as Rubric,
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
      <SortableContext
        items={templates.map((template) => template.key)}
        strategy={verticalListSortingStrategy}
      >
        <AnimatePresence>
          {templates.map((template, index) => (
            <motion.div
              key={template.key}
              initial={{
                opacity: 0,
                y: 50,
              }} // Starting state (entry animation)
              animate={{
                opacity: 1,
                y: 0,
              }} // Animate to this state when in the DOM
              exit={{ opacity: 0, x: 50 }} // Ending state (exit animation)
              transition={{ duration: 0.3 }} // Controls the duration of the animations
              className="my-1"
            >
              <TemplateCard
                index={index}
                activeTemplateIndex={activeTemplateIndex}
                template={template}
                handleTemplateUpdate={handleUpdateTemplate}
                removeTemplate={handleRemoveTemplate}
                setActiveTemplateIndex={setActiveTemplateIndex}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </SortableContext>
    );
  };

  /**
   * Helper function to consolidate conditional rendering in the JSX.
   */

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen justify-between flex flex-col w-screen bg-gradient-to-b from-gray-900 to-gray-700 text-white font-sans">
        {/* Sticky Header with Gradient */}
        <Header />
        <div className="mt-6 flex flex-col ">{renderUserTemplates()}</div>
        {/* ModalChoiceDialog */}
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
        {/* Template Import Dialog */}
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
        {/* Sticky Footer with Gradient */}
        <Footer />
      </div>
    </DndContext>
  );
}
