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

export default function TemplateCard({
  index,
  activeTemplateIndex,
  template,
  handleTemplateUpdate,
  removeTemplate,
  setActiveTemplateIndex,
  isNewTemplate,
}: {
  index: number;
  activeTemplateIndex: number;
  template: Template;
  handleTemplateUpdate: (index: number, template: Template) => void;
  removeTemplate: (index: number) => void;
  setActiveTemplateIndex: (index: number) => void;
  isNewTemplate: boolean;
}): ReactElement {
  const [maxPoints, setMaxPoints] = useState<number>(0); // Initialize state for max points
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

  const closeModal = useCallback(
    () => setModal((prevModal) => ({ ...prevModal, isOpen: false })),
    []
  );

  /**
   * Whenever ratings change, recalculate criterion's max points
   */
  useEffect(() => {
    if (!template) return;
    const maxPoints = template.criteria.reduce((acc, criterion) => {
      return acc + criterion.ratings.length;
    }, 0);
    setMaxPoints(maxPoints);
  }, [currentTemplate]);

  // update rubric state with new list of criteria
  const handleAddCriteria = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!currentTemplate) return;
    const newCriteria = [...currentTemplate.criteria, createCriterion()];
    setCurrentTemplate({ ...currentTemplate, criteria: newCriteria });
    handleTemplateUpdate(index, { ...currentTemplate, criteria: newCriteria });
    setActiveCriterionIndex(newCriteria.length - 1);
  };

  const handleRemoveCriterion = (index: number, criterion: Criteria) => {
    if (!currentTemplate) return; // do nothing if there is no active rubric
    console.log("removing criterion", criterion);
    const deleteCriterion = () => {
      const newCriteria = [...template.criteria];
      newCriteria.splice(index, 1); // remove the target criterion from the array
      handleTemplateUpdate(index, { ...template, criteria: newCriteria });
      //set template to be the new template
      setCurrentTemplate({ ...template, criteria: newCriteria });
      console.log("new template", currentTemplate);
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
    newCriteria[index] = criterion; // update the criterion with changes;

    handleTemplateUpdate(index, { ...template, criteria: newCriteria }); // update rubric to have new criteria
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
          <strong>{template.title}</strong> - Max Points: {maxPoints}
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
            {maxPoints} {maxPoints === 1 ? "Point" : "Points"}
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
            // onClick={(event) => void handleSubmitRubric(event)}
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
