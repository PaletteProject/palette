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

interface TemplateCardProps {
  index: number;
  activeTemplateIndex: number;
  template: Template;
  updateTemplateHandler: (index: number, template: Template) => void;
  removeTemplate: (index: number) => void;
  activeTemplateIndexHandler: (index: number) => void;
  isNewTemplate: boolean;
  submitTemplateHandler: () => void;
  existingTemplates: Template[];
  viewMode: "list" | "grid";
  templateFocused: boolean;
  onTemplateFocusedToggle: (templateKey?: string) => void;
}

export default function TemplateCard({
  index,
  activeTemplateIndex,
  template,
  updateTemplateHandler,
  removeTemplate,
  activeTemplateIndexHandler,
  isNewTemplate,
  submitTemplateHandler,
  existingTemplates,
  viewMode,
  templateFocused,
  onTemplateFocusedToggle,
}: TemplateCardProps): ReactElement {
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
  const [isFocused, setIsFocused] = useState(false);

  const cardClassName =
    viewMode === "grid"
      ? "h-[300px] flex flex-col"
      : "flex flex-row items-start";

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
  }, [currentTemplate, index, updateTemplateHandler]);

  // update rubric state with new list of criteria
  const handleAddCriteria = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!currentTemplate) return;
    const newCriteria = [...currentTemplate.criteria, createCriterion()];
    const updatedTemplate = { ...currentTemplate, criteria: newCriteria };
    setCurrentTemplate(updatedTemplate);
    updateTemplateHandler(index, updatedTemplate);
    setActiveCriterionIndex(newCriteria.length - 1);
    updateTemplateHandler(index, updatedTemplate);
  };

  const handleRemoveCriterion = (index: number, criterion: Criteria) => {
    if (!currentTemplate) return;
    const deleteCriterion = () => {
      const newCriteria = [...currentTemplate.criteria];
      newCriteria.splice(index, 1);
      const updatedTemplate = { ...currentTemplate, criteria: newCriteria };
      setCurrentTemplate(updatedTemplate);
      updateTemplateHandler(index, updatedTemplate);
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
    updateTemplateHandler(index, updatedTemplate);
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

  const submitTemplate = (event: ReactMouseEvent) => {
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

    activeTemplateIndexHandler(-1);
    setIsEditModalOpen(false);
    submitTemplateHandler();
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
          ${templateFocused ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800" : ""}
          ${viewMode === "grid" && templateFocused ? "shadow-2xl shadow-gray-900/50" : ""}
        }`}
        onDoubleClick={handleDoubleClick}
      >
        <div className="text-gray-300">
          <strong>{template.title}</strong> - Max Points: {localMaxPoints}
        </div>
        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFocused(!templateFocused);
              onTemplateFocusedToggle(
                templateFocused ? undefined : template.key
              );
            }}
            title={
              templateFocused
                ? "Hide template metadata"
                : "Show template metadata"
            }
            className="text-gray-300 hover:text-white focus:outline-none text-xl font-bold"
          >
            {templateFocused ? "-" : "+"}
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
              updateTemplateHandler(index, newTemplate);
            }}
            className=" rounded p-3 mb-4 hover:bg-gray-200 focus:bg-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 w-full max-w-full text-xl truncate whitespace-nowrap"
            placeholder="Template title"
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

  const renderTemplateMetadata = () => {
    return (
      <div
        className={`bg-gradient-to-br from-gray-700 to-gray-600 p-4 border-4 border-gray-700 my-4 rounded-lg ${cardClassName} ${
          viewMode === "grid" ? "max-h-52" : ""
        } ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800`}
      >
        <div className="flex-1">
          <p className="text-gray-300 mt-2 line-clamp-2">
            This is where the description goes. Will update this later in the
            rubric builder later.
          </p>

          {/* Template Statistics */}
          <div className="text-sm text-gray-400 mt-4">
            <p>Created: {new Date(template.createdAt).toLocaleDateString()}</p>
            <p>
              Last Used:{" "}
              {template.lastUsed
                ? new Date(template.lastUsed).toLocaleDateString()
                : "Never"}
            </p>
            <p>Times Used: {template.usageCount || 0}</p>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="transition-all ease-in-out duration-300 text-blue-400 hover:text-blue-500 focus:outline-none"
            >
              Edit
            </button>
            <button
              onPointerDown={() => removeTemplate(index)}
              type="button"
              className="transition-all ease-in-out duration-300 text-red-600 hover:text-red-700 focus:outline-none"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add effect to handle focus state based on isQuickEdit
  useEffect(() => {
    if (!templateFocused) {
      setIsFocused(false);
    }
  }, [templateFocused]);

  return (
    <>
      {activeTemplateIndex === index
        ? renderDetailedView()
        : renderCondensedView()}
      {isEditModalOpen && (
        <EditTemplateModal
          onClose={() => setIsEditModalOpen(false)}
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
      {templateFocused && renderTemplateMetadata()}
    </>
  );
}
