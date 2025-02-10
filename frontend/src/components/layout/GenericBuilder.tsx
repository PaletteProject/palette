import { Criteria, Rubric, Template } from "palette-types";
import { useTemplatesContext } from "../../features/templatesPage/TemplateContext";
import React, {
  MouseEvent as ReactMouseEvent,
  useCallback,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import CriteriaCard from "src/features/rubricBuilder/CriteriaCard";
import { createCriterion } from "@utils";
import { Choice, ChoiceDialog, Dialog } from "@components";
import AllTags from "src/features/templatesPage/AllTags";

interface GenericBuilderProps {
  builderType: "template" | "rubric";
  document: Template | Rubric;
  setDocument: (document: Template | Rubric) => void;
  onSubmit: () => void;
}

export const GenericBuilder = ({
  builderType,
  document,
  setDocument,
  onSubmit,
}: GenericBuilderProps) => {
  const {
    editingTemplate,
    setEditingTemplate,
    viewingTemplate,
    setViewingTemplate,
    handleUpdateTemplate,
    viewOrEdit,
    templates,
    setAddingTagFromBuilder,
    setHasUnsavedChanges,
  } = useTemplatesContext();

  // tracks which criterion card is displaying the detailed view (limited to one at a time)
  const [activeCriterionIndex, setActiveCriterionIndex] = useState(-1);
  const [showDialog, setShowDialog] = useState(false);
  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
    choices: [] as Choice[],
  });

  const defaultChoice: Choice = {
    label: "OK",
    action: function (): void {
      throw new Error("Function not implemented.");
    },
    autoFocus: true,
  };
  const closeModal = useCallback(
    () => setModal((prevModal) => ({ ...prevModal, show: false })),
    [],
  );

  const handleDocumentTitleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();

    const newTitle = e.target.value;
    if (builderType === "template" && editingTemplate) {
      const updatedTemplate = {
        ...document,
        title: newTitle,
      } as Template;
      setDocument(updatedTemplate);
      setHasUnsavedChanges(true);
    } else if (builderType === "rubric") {
      const updatedRubric = {
        ...document,
        title: newTitle,
      } as Rubric;
      setDocument(updatedRubric);
    }
  };

  // update criterion at given index
  const handleUpdateCriterion = (index: number, criterion: Criteria) => {
    if (!editingTemplate) return;
    const newCriteria = [...editingTemplate.criteria];
    newCriteria[index] = criterion;
    const updatedTemplate = {
      ...editingTemplate,
      criteria: newCriteria,
      points: newCriteria.reduce(
        (acc, criterion) => acc + criterion.pointsPossible,
        0,
      ),
    };
    if (builderType === "template") {
      setEditingTemplate(updatedTemplate as Template);
      handleUpdateTemplate(index, updatedTemplate as Template);
    } else {
      setViewingTemplate(updatedTemplate as Template);
    }
    // console.log("criterion updated");
  };

  const handleRemoveCriterion = (index: number, criterion: Criteria) => {
    // if (!template) return;
    if (!document) return;

    const deleteTemplateCriterion = () => {
      const newCriteria = [...(editingTemplate?.criteria || [])];
      newCriteria.splice(index, 1);

      const updatedTemplate = { ...editingTemplate, criteria: newCriteria };
      updatedTemplate.points = updatedTemplate.criteria.reduce(
        (acc, criterion) => acc + criterion.pointsPossible,
        0,
      );
      // console.log("updatedTemplate points", updatedTemplate.points);
      setEditingTemplate(updatedTemplate as Template);
      handleUpdateTemplate(index, updatedTemplate as Template);
      setHasUnsavedChanges(true);
    };

    const deleteRubricCriterion = () => {
      const newCriteria = [...document.criteria];
      newCriteria.splice(index, 1);
      setDocument({ ...document, criteria: newCriteria });
      setHasUnsavedChanges(true);
    };

    if (builderType === "template") {
      setModal({
        show: true,
        title: "Confirm Criterion Removal",
        message: `Are you sure you want to remove ${criterion.description}? This action is (currently) not reversible.`,
        choices: [
          {
            ...defaultChoice,
            label: "Destroy it!",
            action: () => {
              deleteTemplateCriterion();
              closeModal();
            },
          },
        ],
      });
    } else {
      setModal({
        show: true,
        title: "Confirm Criterion Removal",
        message: `Are you sure you want to remove ${criterion.description}? This action is (currently) not reversible.`,
        choices: [
          {
            ...defaultChoice,
            label: "Destroy it!",
            action: () => {
              deleteRubricCriterion();
              closeModal();
            },
          },
        ],
      });
    }
  };

  const renderCriteriaCards = () => {
    if (!document) return;

    return (
      <SortableContext
        items={document.criteria.map((criterion) => criterion.key)}
        strategy={verticalListSortingStrategy}
      >
        <AnimatePresence>
          {document.criteria.map((criterion, index) => (
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
              <CriteriaCard
                index={index}
                activeCriterionIndex={activeCriterionIndex}
                criterion={criterion}
                handleCriteriaUpdate={handleUpdateCriterion}
                removeCriterion={handleRemoveCriterion}
                setActiveCriterionIndex={setActiveCriterionIndex}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </SortableContext>
    );
  };

  const handleAddCriteria = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!document) return;

    if (builderType === "template") {
      const newCriterion = createCriterion();
      newCriterion.template = document.key;
      const newCriteria = [...document.criteria, newCriterion];

      const updatedTemplate = {
        ...document,
        criteria: newCriteria,
        points: newCriteria.reduce(
          (acc, criterion) => acc + criterion.pointsPossible,
          0,
        ),
      };
      setEditingTemplate(updatedTemplate as Template);
      setActiveCriterionIndex(newCriteria.length - 1);
      setHasUnsavedChanges(true);
    } else {
      const newCriteria = [...document.criteria, createCriterion()];
      setDocument({ ...document, criteria: newCriteria });
      setActiveCriterionIndex(newCriteria.length - 1);
    }
  };

  const submitDocument = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (document?.title.trim() === "") {
      setModal({
        show: true,
        title: "Invalid Template",
        message: "Please enter a title for your template before saving.",
        choices: [
          {
            ...defaultChoice,
            action: closeModal,
          },
        ],
      });
      return;
    }

    if (document?.criteria.length === 0) {
      setModal({
        show: true,
        title: "Invalid Template",
        message: "Please add at least one criterion before saving.",
        choices: [
          {
            ...defaultChoice,
            action: closeModal,
          },
        ],
      });
      return;
    }

    if (builderType === "template") {
      const isDuplicateName = templates.some(
        (t) =>
          t.title.toLowerCase() === document?.title.toLowerCase() &&
          t.key !== document?.key,
      );
      if (isDuplicateName) {
        setModal({
          show: true,
          title: "Duplicate Template Name",
          message:
            "A template with this name already exists. Please choose a different name.",
          choices: [
            {
              ...defaultChoice,
              action: closeModal,
            },
          ],
        });
        return;
      }
    }
    onSubmit();
  };

  return (
    <>
      <form
        className="h-full grid p-4 sm:p-6 md:p-4 w-full max-w-3xl my-3 gap-4 bg-gray-800 shadow-lg rounded-lg"
        onSubmit={(event) => event.preventDefault()}
      >
        {viewOrEdit === "edit" ? (
          <input
            type="text"
            value={editingTemplate?.title}
            required={true}
            onChange={(e) => handleDocumentTitleChange(e)}
            className="rounded p-2 mb-2 hover:bg-gray-200 focus:bg-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 w-full max-w-full text-lg truncate whitespace-nowrap"
            placeholder={
              builderType === "template" ? "Template title" : "Rubric title"
            }
          />
        ) : (
          <h1 className="font-extrabold text-3xl sm:text-4xl mb-2 text-center">
            {builderType === "template" ? (
              viewingTemplate?.title
            ) : (
              <>Rubric: {viewingTemplate?.title}</>
            )}
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
              onClick={() => {
                setShowDialog(true);
                setAddingTagFromBuilder(true);
              }}
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
              onClick={(event) => submitDocument(event)}
              type={"button"}
            >
              Save Template
            </button>
          </div>
        )}
      </form>

      <ChoiceDialog modal={modal} onHide={closeModal} />

      <Dialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title={`Add Tag(s) to Template: "${editingTemplate?.title}"`}
        children={<AllTags onSave={() => setShowDialog(false)} />}
      />
    </>
  );
};
