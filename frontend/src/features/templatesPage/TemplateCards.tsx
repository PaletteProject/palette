import {
  MouseEvent as ReactMouseEvent,
  ReactElement,
  useEffect,
  useState,
  ChangeEvent,
} from "react";
import CriteriaInput from "../rubricBuilder/CriteriaInput.tsx";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"; // Import useSortable
import { CSS } from "@dnd-kit/utilities"; // Import CSS utilities
import { Criteria, Tag, Template } from "palette-types";
import { createCriterion } from "@utils";
import { AnimatePresence, motion } from "framer-motion";
import { EditTemplateModal, ModalChoiceDialog } from "@components";
import TemplateTagModal from "src/components/modals/TemplateTagModal.tsx";
import { useTemplatesContext } from "./TemplateContext.tsx";
import { useEditModal } from "./EditModalProvider.tsx";
interface TemplateCardProps {
  template: Template;
}

export default function TemplateCard({
  template,
}: TemplateCardProps): ReactElement {
  const {
    layoutStyle,
    setModal,
    modal,
    handleUpdateTemplate,
    closeModal,
    handleRemoveTemplate,
    templates,
    handleSubmitNewTemplate,
    isNewTemplate,
    index,
    handleDuplicateTemplate,
    setDuplicateTemplate,
    viewOrEdit,
    setViewOrEdit,
    editingTemplate,
    setEditingTemplate,
    focusedTemplateKey,
    setFocusedTemplateKey,
    setIsNewTemplate,
    setShowBulkActions,
    setTemplates,
    handleSubmitEditedTemplate,
  } = useTemplatesContext();
  const { isEditModalOpen, setIsEditModalOpen } = useEditModal();
  // tracks which criterion card is displaying the detailed view (limited to one at a time)
  const [activeCriterionIndex, setActiveCriterionIndex] = useState(-1);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [viewOrEditClicked, setViewOrEditClicked] = useState(false);

  // update rubric state with new list of criteria
  const handleAddCriteria = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!editingTemplate) return;
    const newCriterion = createCriterion();
    newCriterion.template = editingTemplate.key;
    const newCriteria = [...editingTemplate.criteria, newCriterion];
    const updatedTemplate = {
      ...editingTemplate,
      criteria: newCriteria,
      points: newCriteria.reduce((acc, criterion) => acc + criterion.points, 0),
    };
    console.log("updatedTemplate criteria", updatedTemplate.criteria);
    setEditingTemplate(updatedTemplate);
    setActiveCriterionIndex(newCriteria.length - 1);
    console.log("new criterion added");
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const updatedTemplate = {
      ...editingTemplate,
      title: event.target.value,
    } as Template;
    setEditingTemplate(updatedTemplate);
  };

  const handleRemoveCriterion = (index: number, criterion: Criteria) => {
    if (!template) return;
    const deleteCriterion = () => {
      const newCriteria = [...(editingTemplate?.criteria || [])];
      newCriteria.splice(index, 1);
      const updatedTemplate = { ...editingTemplate, criteria: newCriteria };
      setEditingTemplate(updatedTemplate as Template);
      handleUpdateTemplate(index, updatedTemplate as Template);
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
    if (!editingTemplate) return;
    const newCriteria = [...editingTemplate.criteria];
    newCriteria[index] = criterion;
    const updatedTemplate = { ...editingTemplate, criteria: newCriteria };
    setEditingTemplate(updatedTemplate as Template);
    handleUpdateTemplate(index, updatedTemplate as Template);
    console.log("criterion updated");
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

  const handleCondensedViewClick = (event: ReactMouseEvent, key: string) => {
    event.preventDefault();
    // If clicking the currently focused template, unfocus it
    if (focusedTemplateKey === key) {
      setFocusedTemplateKey(null);
      setIsFocused(false);
    } else {
      // Focus this template and unfocus others
      setFocusedTemplateKey(key);
      setIsFocused(true);
    }
  };

  // Add effect to sync local focus state with global focused key
  useEffect(() => {
    setIsFocused(focusedTemplateKey === template?.key);
  }, [focusedTemplateKey, template?.key]);

  const handleSetAvailableTags = (tags: Tag[]) => {
    const updatedTemplate = { ...editingTemplate, tags };
    console.log(updatedTemplate);
    setEditingTemplate(updatedTemplate as Template);
    handleUpdateTemplate(index, updatedTemplate as Template);
  };

  const submitTemplate = (event: ReactMouseEvent) => {
    event.preventDefault();

    if (!editingTemplate?.title.trim()) {
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

    if (editingTemplate?.criteria.length === 0) {
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

    if (isNewTemplate) {
      handleSubmitNewTemplate();
    } else {
      handleSubmitEditedTemplate();
    }
    setIsEditModalOpen(false);
    setIsNewTemplate(false);
    setShowBulkActions(false);
  };

  const handleCloseModal = () => {
    setTemplates([]);
    setViewOrEditClicked(false);
    setIsEditModalOpen(false);
  };

  const handleViewModeToggle = () => {
    setViewOrEdit("view");
    setEditingTemplate(template);
    setViewOrEditClicked(true);
    setIsEditModalOpen(true);
  };

  const handleEditModeToggle = () => {
    setViewOrEdit("edit");
    setEditingTemplate(template);
    setViewOrEditClicked(true);
    setIsEditModalOpen(true);
  };

  const copyTemplate = () => {
    setDuplicateTemplate(template);
    handleDuplicateTemplate();
  };

  const setTitleDisplay = () => {
    if (isNewTemplate || viewOrEditClicked) {
      return editingTemplate?.title;
    }
    return template?.title;
  };

  const renderCriteriaCards = () => {
    if (!editingTemplate) return;
    return (
      <SortableContext
        items={editingTemplate.criteria.map((criterion) => criterion.key)}
        strategy={verticalListSortingStrategy}
      >
        <AnimatePresence>
          {editingTemplate.criteria.map((criterion, index) => (
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
          ${isFocused ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800" : ""}
          ${layoutStyle === "grid" && isFocused ? "shadow-2xl shadow-gray-900/50" : ""}
        }`}
        title="Click to toggle expansion"
        onClick={(event) => handleCondensedViewClick(event, template?.key)}
      >
        <div className="text-gray-300">
          <strong>{template?.title}</strong> - Points: {template?.points}
        </div>
      </div>
    );
  };

  const renderDetailedView = () => {
    console.log("rendering detailed view", isNewTemplate);
    console.log("editingTemplate", editingTemplate?.title);
    console.log("template", template?.title);
    return (
      <form
        className="h-full grid p-4 sm:p-6 w-full max-w-3xl my-3 gap-4 bg-gray-800 shadow-lg rounded-lg"
        onSubmit={(event) => event.preventDefault()}
      >
        {viewOrEdit === "edit" ? (
          <input
            type="text"
            value={setTitleDisplay()}
            required={true}
            onChange={(e) => handleTitleChange(e)}
            className="rounded p-2 mb-2 hover:bg-gray-200 focus:bg-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 w-full max-w-full text-lg truncate whitespace-nowrap"
            placeholder="Template title"
          />
        ) : (
          <h1 className="font-extrabold text-3xl sm:text-4xl mb-2 text-center">
            {template?.title}
          </h1>
        )}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-extrabold bg-green-600 text-black py-1 px-3 rounded-lg">
            {editingTemplate?.points}{" "}
            {editingTemplate?.points === 1 ? "Point" : "Points"}
          </h2>
          <div className="flex gap-2">
            <button
              className="transition-all ease-in-out duration-300 bg-blue-600 text-white font-bold rounded-lg py-1 px-3
                       hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setTagModalOpen(true)}
            >
              Add Tag
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 h-[30vh] sm:h-[35vh] overflow-y-auto overflow-hidden scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800">
          {renderCriteriaCards()}
        </div>

        {viewOrEdit === "edit" && (
          <div className="grid gap-2 mt-3">
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
              onClick={copyTemplate}
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

  return (
    <>
      <div className={`w-full `}>
        {renderCondensedView()}
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
      {(isNewTemplate || viewOrEditClicked) && (
        <EditTemplateModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          children={renderDetailedView()}
        />
      )}
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
