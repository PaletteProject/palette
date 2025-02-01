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
import { Criteria, Rating, Tag, Template } from "palette-types";
import { createCriterion } from "@utils";
import { AnimatePresence, motion } from "framer-motion";
import { EditTemplateModal, ModalChoiceDialog } from "@components";
import TemplateTagModal from "src/components/modals/TemplateTagModal.tsx";
import { useTemplatesContext } from "./TemplateContext.tsx";
interface TemplateCardProps {
  index: number;
  isNewTemplate: boolean;
  templateFocused: boolean;
  onTemplateFocusedToggle: (templateKey?: string) => void;
  isSelected: boolean;
  viewOrEdit: "edit" | "view";
  template: Template;
}

export default function TemplateCard({
  index,
  isNewTemplate,
  templateFocused,
  onTemplateFocusedToggle,
  viewOrEdit,
  template,
}: TemplateCardProps): ReactElement {
  const {
    setNewTemplate,
    layoutStyle,
    setModal,
    modal,
    handleUpdateTemplate,
    closeModal,
    handleRemoveTemplate,
    templates,
    handleSubmitTemplate,
  } = useTemplatesContext();
  // tracks which criterion card is displaying the detailed view (limited to one at a time)
  const [activeCriterionIndex, setActiveCriterionIndex] = useState(-1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [localMaxPoints, setLocalMaxPoints] = useState(0);
  const [isFocused, setIsFocused] = useState(templateFocused);
  const [isViewMode, setIsViewMode] = useState(false);

  /**
   * Whenever ratings change, recalculate criterion's max points
   */
  useEffect(() => {
    if (!template) return;
    const calculatedMaxPoints = template.criteria.reduce(
      (acc: number, criterion: Criteria) => {
        return (
          acc +
          criterion.ratings.reduce(
            (sum: number, rating: Rating) => sum + rating.points,
            0
          )
        );
      },
      0
    );
    setLocalMaxPoints(calculatedMaxPoints);
  }, [template, index, handleUpdateTemplate]);

  // update rubric state with new list of criteria
  const handleAddCriteria = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    console.log(template);
    if (!template) return;
    console.log(template);
    const newCriteria = [...template.criteria, createCriterion()];
    const updatedTemplate = { ...template, criteria: newCriteria };
    setNewTemplate(updatedTemplate);
    handleUpdateTemplate(index, updatedTemplate);
    setActiveCriterionIndex(newCriteria.length - 1);
    handleUpdateTemplate(index, updatedTemplate);
  };

  const handleRemoveCriterion = (index: number, criterion: Criteria) => {
    if (!template) return;
    const deleteCriterion = () => {
      const newCriteria = [...template.criteria];
      newCriteria.splice(index, 1);
      const updatedTemplate = { ...template, criteria: newCriteria };
      setNewTemplate(updatedTemplate);
      handleUpdateTemplate(index, updatedTemplate);
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
    if (!template) return;
    const newCriteria = [...template.criteria];
    newCriteria[index] = criterion;
    const updatedTemplate = { ...template, criteria: newCriteria };
    setNewTemplate(updatedTemplate);
    handleUpdateTemplate(index, updatedTemplate);
  };

  // Use the useSortable hook to handle criteria ordering
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: template?.key || "",
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCondensedViewClick = (event: ReactMouseEvent) => {
    event.preventDefault();
    setIsFocused(!isFocused);
    onTemplateFocusedToggle(isFocused ? undefined : template?.key);
  };

  const handleSetAvailableTags = (tags: Tag[]) => {
    const updatedTemplate = { ...template, tags };
    console.log(updatedTemplate);
    setNewTemplate(updatedTemplate as Template);
    handleUpdateTemplate(index, updatedTemplate as Template);
  };

  const submitTemplate = (event: ReactMouseEvent) => {
    event.preventDefault();

    if (!template?.title.trim()) {
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

    if (template?.criteria.length === 0) {
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

    const isDuplicateName = templates.some(
      (t) =>
        t.title.toLowerCase() === template?.title.toLowerCase() &&
        t.key !== template?.key
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
    handleSubmitTemplate();
  };

  const handleCloseModal = () => {
    setNewTemplate(template as Template); // Reset to original template
    setIsEditModalOpen(false);
  };

  const handleDuplicateTemplate = () => {
    const baseName = template?.title.replace(/\s*\(\d+\)$/, ""); // Remove existing numbers in parentheses
    let counter = 1;
    let newTitle = `${baseName} (${counter})`;

    // Find an available number for the copy
    while (
      templates.some((t) => t.title.toLowerCase() === newTitle.toLowerCase())
    ) {
      counter++;
      newTitle = `${baseName} (${counter})`;
    }

    // const duplicatedTemplate : Template = {
    //   ...newTemplate,
    //   key: crypto.randomUUID(),
    //   title: newTitle,
    //   createdAt: new Date(),
    //   lastUsed: new Date(),
    //   usageCount: 0,
    //     criteria: newTemplate?.criteria || [],
    //   tags: newTemplate?.tags || [],
    // };

    // duplicateTemplate(duplicatedTemplate);
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
    if (!template) return;
    return (
      <SortableContext
        items={template.criteria.map((criterion) => criterion.key)}
        strategy={verticalListSortingStrategy}
      >
        <AnimatePresence>
          {template.criteria.map((criterion, index) => (
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
          <strong>{template?.title}</strong> - Points: {localMaxPoints}
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
            value={template?.title}
            required={true}
            onChange={(e) => {
              const newTemplate = {
                ...template,
                title: e.target.value,
              };
              setNewTemplate(newTemplate as Template);
              handleUpdateTemplate(index, newTemplate as Template);
            }}
            className=" rounded p-3 mb-4 hover:bg-gray-200 focus:bg-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 w-full max-w-full text-xl truncate whitespace-nowrap"
            placeholder="Template title"
          />
        ) : (
          <h1 className="font-extrabold text-5xl mb-2 text-center">
            {template?.title}
          </h1>
        )}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-extrabold bg-green-600 text-black py-2 px-4 rounded-lg">
            {localMaxPoints} {localMaxPoints === 1 ? "Point" : "Points"}
          </h2>
          <div className="flex gap-2">
            <button
              className="transition-all ease-in-out duration-300 bg-blue-600 text-white font-bold rounded-lg py-2 px-4
                       hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setTagModalOpen(true)}
            >
              Add Tag
            </button>
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
              {template?.createdAt
                ? new Date(template?.createdAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Never"}
            </p>
            <p>
              Last Used:{" "}
              {template?.lastUsed
                ? new Date(template?.lastUsed).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Never"}
            </p>
            <p>Times Used: {template?.usageCount || 0}</p>
            <p>
              Tags:{" "}
              {template?.tags?.length && template?.tags?.length > 0
                ? template?.tags.map((tag) => tag.name).join(", ")
                : "None"}
            </p>
            <p>Template Key: {template?.key}</p>
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
              onPointerDown={() => handleRemoveTemplate(index)}
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
      {tagModalOpen && (
        <TemplateTagModal
          isOpen={tagModalOpen}
          onClose={() => setTagModalOpen(false)}
          setAvailableTags={handleSetAvailableTags}
        />
      )}
    </>
  );
}
