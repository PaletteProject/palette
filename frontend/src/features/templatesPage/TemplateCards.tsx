import {
  MouseEvent as ReactMouseEvent,
  ReactElement,
  useEffect,
  useState,
  useCallback,
} from "react";
import CriteriaInput from "../rubricBuilder/CriteriaInput.tsx";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"; // Import useSortable
import { CSS } from "@dnd-kit/utilities"; // Import CSS utilities
import { Criteria, Template } from "palette-types";
import { createCriterion } from "@utils";
import { AnimatePresence, motion } from "framer-motion";
import { EditTemplateModal, ModalChoiceDialog } from "@components";
import { useFetch } from "@hooks";

export default function TemplateCard({
  index,
  activeTemplateIndex,
  template,
  handleTemplateUpdate,
  removeTemplate,
  setActiveTemplateIndex,
  isNewTemplate,
  handleSubmitTemplate,
  existingTemplates,
}: {
  index: number;
  activeTemplateIndex: number;
  template: Template;
  handleTemplateUpdate: (index: number, template: Template) => void;
  removeTemplate: (index: number) => void;
  setActiveTemplateIndex: (index: number) => void;
  isNewTemplate: boolean;
  handleSubmitTemplate: (index: number) => void;
  existingTemplates: Template[];
}): ReactElement {
  // tracks which criterion card is displaying the detailed view (limited to one at a time)
  const [activeCriterionIndex, setActiveCriterionIndex] = useState(-1);
  const [currentTemplate, setCurrentTemplate] = useState<Template>(template);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    choices: [] as { label: string; action: () => void }[],
  });
  const [localMaxPoints, setLocalMaxPoints] = useState(0);

  const closeModal = useCallback(
    () => setModal((prevModal) => ({ ...prevModal, isOpen: false })),
    []
  );

  /**
   * Whenever ratings change, recalculate criterion's max points
   */
  useEffect(() => {
    if (!currentTemplate) return;
    const calculatedMaxPoints = currentTemplate.criteria.reduce(
      (acc, criterion) => {
        return (
          acc +
          criterion.ratings.reduce((sum, rating) => sum + rating.points, 0)
        );
      },
      0
    );
    setLocalMaxPoints(calculatedMaxPoints);
  }, [currentTemplate, index, handleTemplateUpdate]);

  // update rubric state with new list of criteria
  const handleAddCriteria = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!currentTemplate) return;
    const newCriteria = [...currentTemplate.criteria, createCriterion()];
    const updatedTemplate = { ...currentTemplate, criteria: newCriteria };
    setCurrentTemplate(updatedTemplate);
    handleTemplateUpdate(index, updatedTemplate);
    setActiveCriterionIndex(newCriteria.length - 1);
    handleTemplateUpdate(index, updatedTemplate);
  };

  const handleRemoveCriterion = (index: number, criterion: Criteria) => {
    if (!currentTemplate) return;
    const deleteCriterion = () => {
      const newCriteria = [...currentTemplate.criteria];
      newCriteria.splice(index, 1);
      const updatedTemplate = { ...currentTemplate, criteria: newCriteria };
      setCurrentTemplate(updatedTemplate);
      handleTemplateUpdate(index, updatedTemplate);
    };

    setModal({
      isOpen: true,
      title: "Confirm Criterion Removal",
      message: `Are you sure you want to remove ${criterion.description}? This action is (currently) not reversible.`,
      choices: [
        {
          label: "Destroy it!",
          action: () => {
            deleteCriterion();
            closeModal();
          },
        },
      ],
    });
  };

  // update criterion at given index
  const handleUpdateCriterion = (index: number, criterion: Criteria) => {
    if (!currentTemplate) return;
    const newCriteria = [...currentTemplate.criteria];
    newCriteria[index] = criterion;
    const updatedTemplate = { ...currentTemplate, criteria: newCriteria };
    setCurrentTemplate(updatedTemplate);
    handleTemplateUpdate(index, updatedTemplate);
  };

  // Use the useSortable hook to handle criteria ordering
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: template.key,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDoubleClick = (event: ReactMouseEvent) => {
    event.preventDefault();
    setIsEditModalOpen(true);
  };

  const submitTemplate = async (event: ReactMouseEvent) => {
    event.preventDefault();

    if (!currentTemplate.title.trim()) {
      setModal({
        isOpen: true,
        title: "Invalid Template",
        message: "Please enter a title for your template before saving.",
        choices: [
          {
            label: "OK",
            action: closeModal,
          },
        ],
      });
      return;
    }

    if (currentTemplate.criteria.length === 0) {
      setModal({
        isOpen: true,
        title: "Invalid Template",
        message: "Please add at least one criterion before saving.",
        choices: [
          {
            label: "OK",
            action: closeModal,
          },
        ],
      });
      return;
    }

    const isDuplicateName = existingTemplates.some(
      (t) =>
        t.title.toLowerCase() === currentTemplate.title.toLowerCase() &&
        t.key !== currentTemplate.key
    );

    if (isDuplicateName) {
      setModal({
        isOpen: true,
        title: "Duplicate Template Name",
        message:
          "A template with this name already exists. Please choose a different name.",
        choices: [
          {
            label: "OK",
            action: closeModal,
          },
        ],
      });
      return;
    }

    console.log("template saved");
    setActiveTemplateIndex(-1);
    handleSubmitTemplate(index);
  };

  const renderCriteriaCards = () => {
    if (!currentTemplate) return;
    return (
      <SortableContext
        items={currentTemplate.criteria.map((criterion) => criterion.key)}
        strategy={verticalListSortingStrategy}
      >
        <AnimatePresence>
          {currentTemplate.criteria.map((criterion, index) => (
            <motion.div
              key={criterion.key}
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
              <CriteriaInput
                index={index}
                activeCriterionIndex={activeCriterionIndex}
                criterion={criterion}
                handleCriteriaUpdate={handleUpdateCriterion}
                removeCriterion={handleRemoveCriterion}
                setActiveCriterionIndex={setActiveCriterionIndex}
                addingFromTemplateUI={true}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </SortableContext>
    );
  };

  const renderCondensedView = () => {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`hover:bg-gray-500 hover:cursor-pointer max-h-12 flex justify-between items-center border border-gray-700 shadow-xl p-6 rounded-lg w-full bg-gray-700
        }`}
        onDoubleClick={handleDoubleClick}
      >
        <div className="text-gray-300">
          <strong>{template.title}</strong> - Max Points: {localMaxPoints}
        </div>
        <div className={"flex gap-3"}>
          <button
            onPointerDown={() => removeTemplate(index)}
            type={"button"}
            className="transition-all ease-in-out duration-300 bg-red-600 text-white font-bold rounded-lg px-2 py-1 hover:bg-red-700 focus:outline-none border-2 border-transparent"
          >
            Remove
          </button>
        </div>
      </div>
    );
  };

  const renderDetailedView = () => {
    return (
      <form
        className="h-full grid p-10 w-full max-w-3xl my-6 gap-6 bg-gray-800 shadow-lg rounded-lg"
        onSubmit={(event) => event.preventDefault()}
      >
        {isNewTemplate ? (
          <input
            type="text"
            value={currentTemplate.title}
            required={true}
            onChange={(e) => {
              const newTemplate = { ...currentTemplate, title: e.target.value };
              setCurrentTemplate(newTemplate);
              handleTemplateUpdate(index, newTemplate);
            }}
            className=" text-xl mb-2 text-center bg-gray-700 rounded-lg p-2 border-b-2 border-gray-600 focus:border-blue-500 outline-none"
            placeholder="Enter template title..."
          />
        ) : (
          <h1 className="font-extrabold text-5xl mb-2 text-center">
            {template.title}
          </h1>
        )}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-extrabold bg-green-600 text-black py-2 px-4 rounded-lg">
            {localMaxPoints} {localMaxPoints === 1 ? "Point" : "Points"}
          </h2>
        </div>

        <div className="mt-6 flex flex-col gap-3 h-[35vh] max-h-[50vh] overflow-y-auto overflow-hidden scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800">
          {renderCriteriaCards()}
        </div>

        <div className="grid gap-4 mt-6">
          <button
            className="transition-all ease-in-out duration-300 bg-blue-600 text-white font-bold rounded-lg py-2 px-4
                     hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleAddCriteria}
            type={"button"}
          >
            Add Criteria
          </button>
          <button
            className="transition-all ease-in-out duration-300 bg-green-600 text-white font-bold rounded-lg py-2 px-4
                     hover:bg-green-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={(event) => void submitTemplate(event)}
            type={"button"}
          >
            Save Template
          </button>
        </div>
      </form>
    );
  };

  return (
    <>
      {activeTemplateIndex === index
        ? renderDetailedView()
        : renderCondensedView()}
      {isEditModalOpen && (
        <EditTemplateModal
          template={template}
          onClose={() => setIsEditModalOpen(false)}
          title={template.title}
          children={renderDetailedView()}
          isOpen={isEditModalOpen}
        />
      )}
      {modal.isOpen && (
        <ModalChoiceDialog
          show={modal.isOpen}
          onHide={closeModal}
          title={modal.title}
          message={modal.message}
          choices={modal.choices}
        />
      )}
    </>
  );
}
