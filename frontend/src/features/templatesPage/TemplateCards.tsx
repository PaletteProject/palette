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
  template: Template;
  updateTemplateHandler: (index: number, template: Template) => void;
  removeTemplate: (index: number) => void;
  isNewTemplate: boolean;
  submitTemplateHandler: () => void;
  existingTemplates: Template[];
  layoutStyle: "list" | "grid";
  templateFocused: boolean;
  onTemplateFocusedToggle: (templateKey?: string) => void;
  isSelected: boolean;
  duplicateTemplate: (template: Template) => void;
  viewOrEdit: "edit" | "view";
}

export default function TemplateCard({
  index,
  template,
  updateTemplateHandler,
  removeTemplate,
  isNewTemplate,
  submitTemplateHandler,
  existingTemplates,
  layoutStyle,
  templateFocused,
  onTemplateFocusedToggle,
  duplicateTemplate,
  viewOrEdit,
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
  const [isFocused, setIsFocused] = useState(templateFocused);
  const [isViewMode, setIsViewMode] = useState(false);

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

  const handleCondensedViewClick = (event: ReactMouseEvent) => {
    event.preventDefault();
    setIsFocused(!isFocused);
    onTemplateFocusedToggle(isFocused ? undefined : template.key);
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

    setIsEditModalOpen(false);
    submitTemplateHandler();
  };

  const handleCloseModal = () => {
    setCurrentTemplate(template); // Reset to original template
    setIsEditModalOpen(false);
  };

  const handleDuplicateTemplate = () => {
    const baseName = template.title.replace(/\s*\(\d+\)$/, ""); // Remove existing numbers in parentheses
    let counter = 1;
    let newTitle = `${baseName} (${counter})`;

    // Find an available number for the copy
    while (
      existingTemplates.some(
        (t) => t.title.toLowerCase() === newTitle.toLowerCase()
      )
    ) {
      counter++;
      newTitle = `${baseName} (${counter})`;
    }

    const duplicatedTemplate: Template = {
      ...template,
      key: crypto.randomUUID(), // Generate new unique key
      title: newTitle,
      createdAt: new Date(),
      lastUsed: new Date(),
      usageCount: 0,
    };

    duplicateTemplate(duplicatedTemplate);
  };

  const handleViewModeToggle = () => {
    setIsEditModalOpen(true);
    setIsViewMode(!isViewMode);
  };

  const handleEditModeToggle = () => {
    setIsEditModalOpen(true);
    setIsViewMode(false);
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
                templateViewMode={isViewMode}
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
          ${layoutStyle === "grid" && templateFocused ? "shadow-2xl shadow-gray-900/50" : ""}
          ${isNewTemplate ? "ring-2 ring-green-500 ring-offset-2 ring-offset-gray-800 animate-[fadeOut_2s_ease-out_forwards]" : ""}
        }`}
        title="Click to toggle expansion"
        onClick={handleCondensedViewClick}
      >
        <div className="text-gray-300">
          <strong>{template.title}</strong> - Points: {localMaxPoints}
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
        {isNewTemplate || !isViewMode ? (
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
          <div className="flex gap-2">
            {template.tags.map((tag) => (
              <div
                key={tag.id}
                className="bg-gray-700 text-white px-2 py-1 rounded-lg"
              >
                {tag.name}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 h-[35vh] max-h-[50vh] overflow-y-auto overflow-hidden scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800">
          {renderCriteriaCards()}
        </div>

        {!isViewMode && (
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
        )}
      </form>
    );
  };

  const renderTemplateMetadata = () => {
    return (
      <div
        className={`bg-gradient-to-br from-gray-700 to-gray-600 p-4 border-4 border-gray-700 mt-4 rounded-lg w-full
          ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800`}
      >
        <div className="flex-1">
          <p className="text-gray-300 mt-2 line-clamp-2">
            This is where the description goes. Will update this later in the
            rubric builder later.
          </p>

          {/* Template Statistics */}
          <div className="text-sm text-gray-400 mt-4">
            <p>
              Created:{" "}
              {new Date(template.createdAt).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p>
              Last Used:{" "}
              {template.lastUsed
                ? new Date(template.lastUsed).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Never"}
            </p>
            <p>Times Used: {template.usageCount || 0}</p>
            <p>
              Tags:{" "}
              {template.tags.length > 0
                ? template.tags.map((tag) => tag.name).join(", ")
                : "None"}
            </p>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleViewModeToggle}
              className="transition-all ease-in-out duration-300 text-blue-400 hover:text-blue-500 focus:outline-none"
            >
              View
            </button>
            <button
              onClick={handleEditModeToggle}
              className="transition-all ease-in-out duration-300 text-blue-400 hover:text-blue-500 focus:outline-none"
            >
              Edit
            </button>
            <button
              onClick={handleDuplicateTemplate}
              className="transition-all ease-in-out duration-300 text-green-400 hover:text-green-500 focus:outline-none"
            >
              Copy
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
      <div className={`w-full `}>
        {viewOrEdit === "view" ? renderCondensedView() : renderDetailedView()}
        {isFocused && renderTemplateMetadata()}
      </div>
      {modal.isOpen && (
        <ModalChoiceDialog
          show={modal.isOpen}
          onHide={closeModal}
          title={modal.title}
          message={modal.message}
          choices={modal.choices}
        />
      )}
      <EditTemplateModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        children={renderDetailedView()}
      />
    </>
  );
}
