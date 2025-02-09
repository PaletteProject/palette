/**
 * Rubric Builder view.
 */

import {
  ChangeEvent,
  MouseEvent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import CriteriaInput from "./CriteriaCard.tsx";
import TemplateUpload from "./TemplateUpload.tsx";
// import TemplateUpload from "./templates/TemplateUpload.tsx";
import { createTemplate } from "src/utils/templateFactory.ts";

import {
  Choice,
  ChoiceDialog,
  Dialog,
  Footer,
  Header,
  LoadingDots,
  NoAssignmentSelected,
  NoCourseSelected,
  PaletteActionButton,
  PopUp,
} from "@components";

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useFetch } from "@hooks";

import { createCriterion, createRubric } from "@utils";

import { Criteria, PaletteAPIResponse, Rubric, Template } from "palette-types";
import { CSVExport, CSVImport } from "@features";
import { AnimatePresence, motion } from "framer-motion";
import { useAssignment, useCourse } from "@context";

export function RubricBuilderMain(): ReactElement {
  /**
   * Get initial rubric from local storage or create a new one if none exists
   */
  const getInitialRubric = () => {
    const rubric = localStorage.getItem("rubric");
    return rubric ? (JSON.parse(rubric) as Rubric) : createRubric();
  };
  /**
   * Rubric Builder State
   */

  // active rubric being edited
  const [rubric, setRubric] = useState<Rubric>(getInitialRubric());
  // tracks which criterion card is displaying the detailed view (limited to one at a time)
  const [activeCriterionIndex, setActiveCriterionIndex] = useState(-1);
  // result of hook checking if active assignment has an existing rubric
  const [hasExistingRubric, setHasExistingRubric] = useState(false);
  // flag for if loading component should be rendered
  const [loading, setLoading] = useState(false);
  // flag to determine if new rubric should be sent via POST or updated via PUT
  const [isNewRubric, setIsNewRubric] = useState(false);

  const [isCanvasBypassed, setIsCanvasBypassed] = useState(false);

  const [updatingTemplate, setUpdatingTemplate] = useState<Template | null>(
    null,
  );

  const [templateInputActive, setTemplateInputActive] = useState(false);

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
    choices: [] as Choice[],
    excludeCancel: false,
  });

  const defaultChoice: Choice = {
    label: "OK",
    autoFocus: false,
    action: () => alert("BUTTON CLICKED"),
  };

  const closePopUp = useCallback(
    () => setPopUp((prevPopUp) => ({ ...prevPopUp, isOpen: false })),
    [],
  );

  const [popUp, setPopUp] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  /**
   * Active Course and Assignment State (Context)
   */
  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();

  /**
   * Custom fetch hooks provide a `fetchData` callback to send any type of fetch request.
   *
   * See PaletteAPIRequest for options structure.
   */

  // GET rubric from the active assignment.
  const { fetchData: getRubric } = useFetch(
    `/courses/${activeCourse?.id}/rubrics/${activeAssignment?.rubricId}`,
  );

  useEffect(() => {
    if (!activeCourse || !activeAssignment) return;
    if (hasExistingRubric) handleExistingRubric();
    if (!hasExistingRubric) handleNewRubric();
  }, [hasExistingRubric]);

  /**
   * Updates active assignment with new or updated rubric.
   */
  const { fetchData: putRubric } = useFetch(
    `/courses/${activeCourse?.id}/rubrics/${activeAssignment?.rubricId}/${activeAssignment?.id}`,
    {
      method: "PUT",
      body: JSON.stringify(rubric),
    },
  );

  const { fetchData: postRubric } = useFetch(
    `/courses/${activeCourse?.id}/rubrics/${activeAssignment?.id}`,
    {
      method: "POST",
      body: JSON.stringify(rubric),
    },
  );

  /* this is for updating the existing templates with most
  recent version of the criteria before saving the rubric
  in case any criterion are updated after intial template selection
  */
  const { fetchData: putTemplate } = useFetch("/templates", {
    method: "PUT",
    body: JSON.stringify(updatingTemplate),
  });

  /**
   * Fires when user selects an assignment that doesn't have a rubric id associated with it.
   */
  const handleNewRubric = () => {
    const newRubric = createRubric();
    setRubric(newRubric);

    setModal({
      isOpen: true,
      excludeCancel: true,
      title: "Build a New Rubric",
      message:
        "The active assignment does not have an associated rubric. Let's build one!",
      choices: [{ label: "OK", action: closeModal, autoFocus: true }],
    });
    setLoading(false);
    setHasExistingRubric(false);
    setIsNewRubric(true);
  };

  /**
   * Effect hook to see if the active assignment has an existing rubric. Apply loading status while waiting to
   * determine which view to render.
   */
  useEffect(() => {
    if (!activeCourse) {
      console.warn("Select a course before trying to fetch rubric");
      return;
    }

    if (!activeAssignment) {
      console.warn("Select a assignment before trying to fetch rubric");
      return;
    }

    setLoading(true);

    const checkRubricExists = async () => {
      if (!activeAssignment.rubricId) {
        handleNewRubric();
        return;
      }

      const response = await getRubric();

      if (!response) {
        setLoading(false);
        return;
      }
      setHasExistingRubric(response.success || false);
      setIsNewRubric(false);
      setRubric(response.data as Rubric);
      setLoading(false);
    };
    void checkRubricExists();
  }, [activeCourse, activeAssignment]);

  /**
   * Rubric change event handlers
   */

  /**
   * If user selects edit existing rubric, the program loads the rubric. When the user clicks "Save Rubric" the
   * program sends a PUT request to apply updates.
   */
  const editRubric = () => {
    closeModal();
  };

  /**
   * If user selects replace existing rubric, the program creates a new rubric for the user to edit.
   *
   * On "Save Rubric", the program sends a POST request to add the new rubric to the associated assignment on Canvas.
   */
  const startNewRubric = () => {
    closeModal();
    const newRubric = createRubric();
    setRubric(newRubric); // set the active rubric to a fresh rubric
  };

  /**
   * Fires when a selected assignment already has a rubric.
   *
   * User has the option to either overwrite the rubric with a fresh start or edit the existing rubric.
   */
  const handleExistingRubric = () => {
    if (!rubric) return;

    setModal({
      isOpen: true,
      excludeCancel: true,
      title: "Existing Rubric Detected",
      message: `A rubric with the title "${rubric.title}" already exists for the active assignment. How would you like to proceed?`,
      choices: [
        {
          ...defaultChoice,
          label: "Edit Rubric",
          action: () => editRubric(),
          autoFocus: true,
        },
        {
          ...defaultChoice,
          label: "Create New Rubric",
          action: () => startNewRubric(),
        },
      ],
    });
  };

  const handleUpdateAllTemplateCriteria = async (): Promise<void> => {
    console.log("updating template criteria");
    console.log(rubric?.criteria);
    const criteriaOnATemplate: Criteria[] = [];
    rubric?.criteria.forEach((criterion) => {
      if (criterion.template !== "") criteriaOnATemplate.push(criterion);
    });

    const existingTemplates: Template[] = [];
    for (const criterion of criteriaOnATemplate) {
      const exitingTemplateIndex = existingTemplates.findIndex(
        (template) => template.key === criterion.template,
      );
      if (exitingTemplateIndex === -1) {
        const template = createTemplate();
        template.key = criterion.template!;
        template.title = criterion.templateTitle!;
        template.criteria.push(criterion);
        existingTemplates.push(template);
      }
    }
    console.log("existing templates");
    console.log(existingTemplates);

    for (const template of existingTemplates) {
      setUpdatingTemplate(template);
      const response = await putTemplate();
      console.log("response", response);
      if (response.success) {
        console.log("template updated successfully");
      } else {
        console.error("error updating template", response.error);
      }
    }
  };

  const handleSubmitRubric = async (event: MouseEvent): Promise<void> => {
    event.preventDefault();
    console.log("submitting rubric");
    await handleUpdateAllTemplateCriteria();
    if (!rubric || !activeCourse || !activeAssignment) return;

    setLoading(true);

    try {
      const response: PaletteAPIResponse<unknown> = isNewRubric
        ? await postRubric()
        : await putRubric();

      if (response.success) {
        setModal({
          excludeCancel: true,
          isOpen: true,
          title: "Success!",
          message: `${rubric.title} ${isNewRubric ? "created" : "updated"}!`,
          choices: [
            { ...defaultChoice, label: "Radical", action: () => closeModal() },
          ],
        });
      } else {
        setModal({
          excludeCancel: true,
          isOpen: true,
          title: "Error!",
          message: `An error occurred: ${response.error || "Unknown error"}`,
          choices: [
            { ...defaultChoice, label: "Close", action: () => closeModal() },
          ],
        });
      }
    } catch (error) {
      console.error("Error handling rubric submission:", error);
      setModal({
        excludeCancel: true,
        isOpen: true,
        title: "Error!",
        message: `An unexpected error occurred: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
        choices: [
          { ...defaultChoice, label: "Close", action: () => closeModal() },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRubricTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setRubric((prevRubric) =>
      prevRubric
        ? { ...prevRubric, title: event.target.value }
        : createRubric(),
    );
  };

  /**
   * Calculate rubric max points whenever rubric criterion changes. Uses memoization to avoid re-rendering the
   * function everytime, improving performance.
   *
   * Defaults to 0 if no criterion is defined.
   */
  const maxPoints = useMemo(() => {
    if (!rubric) return;

    return (
      rubric.criteria.reduce(
        (sum, criterion) =>
          isNaN(criterion.pointsPossible)
            ? sum
            : sum + criterion.pointsPossible,
        0, // init sum to 0
      ) ?? 0 // fallback value if criterion is undefined
    );
  }, [rubric?.criteria]);

  /**
   * Callback function to trigger the creation of a new criterion on the rubric.
   * @param event user clicks "add criteria"
   */
  const handleAddCriteria = (event: MouseEvent) => {
    event.preventDefault();
    if (!rubric) return;
    const newCriteria = [...rubric.criteria, createCriterion()];
    setRubric({ ...rubric, criteria: newCriteria });
    setActiveCriterionIndex(newCriteria.length - 1);
  };

  /**
   * Callback function to remove a target criterion from the rubric. Triggers confirmation modal to avoid any
   * accidental data loss.
   * @param index of the target criterion within the rubric
   * @param criterion target criterion object, used for modal details.
   */
  const handleRemoveCriterion = (index: number, criterion: Criteria) => {
    if (!rubric) return; // do nothing if there is no active rubric

    const deleteCriterion = () => {
      const newCriteria = [...rubric.criteria];
      newCriteria.splice(index, 1);
      setRubric({ ...rubric, criteria: newCriteria });
    };

    setModal({
      excludeCancel: false,
      isOpen: true,
      title: "Confirm Criterion Removal",
      message: `Are you sure you want to remove ${criterion.description}? This action is (currently) not reversible.`,
      choices: [
        {
          ...defaultChoice,
          label: "Destroy it!",
          action: () => {
            deleteCriterion();
            closeModal();
          },
        },
      ],
    });
  };

  /**
   * Callback function to update a target criterion with new changes within the rubric.
   * @param index target criterion index to update
   * @param criterion updated criterion object
   */
  const handleUpdateCriterion = (index: number, criterion: Criteria) => {
    if (!rubric) return;
    const newCriteria = [...rubric.criteria];
    newCriteria[index] = criterion; // update the criterion with changes;
    setRubric({ ...rubric, criteria: newCriteria }); // update rubric to have new criteria
  };

  const handleOpenTemplateImport = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!templateInputActive) {
      setTemplateInputActive(true);
    }
  };

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
    console.log("import template in rubric builder main");
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
   * Render a card for each criterion in the active rubric.
   *
   * The Sortable Context wrapper allows the drag and drop to dynamically apply sorting. The Animate Presence wrapper
   * with the motion.div enable the transitions in and out.
   */
  const renderCriteriaCards = () => {
    if (!rubric) return;
    return (
      <SortableContext
        items={rubric.criteria.map((criterion) => criterion.key)}
        strategy={verticalListSortingStrategy}
      >
        <AnimatePresence>
          {rubric.criteria.map((criterion, index) => (
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
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </SortableContext>
    );
  };

  /**
   * Effect to load a default rubric if canvas api is bypassed
   */
  useEffect(() => {
    if (isCanvasBypassed && !rubric) {
      setRubric(createRubric());
    }
    if (!rubric) return;
    localStorage.setItem("rubric", JSON.stringify(rubric));
  }, [isCanvasBypassed, rubric]);

  const deleteAllCriteria = () => {
    const newCriteria: Criteria[] = []; // empty array to reset all criteria
    setRubric({ ...rubric, criteria: newCriteria });
  };

  const removeAllCriteria = () => {
    setModal({
      excludeCancel: false,
      isOpen: true,
      title: "Clear All Criteria?",
      message: "Are you sure you want to remove all criteria on the form?",
      choices: [
        {
          ...defaultChoice,
          label: "Purge Them All",
          action: () => {
            deleteAllCriteria();
            closeModal();
          },
        },
      ],
    });
  };

  /**
   * Helper function to wrap the builder JSX.
   */
  const renderRubricBuilderForm = () => {
    if (!rubric) return <p>No Active Rubric</p>;

    return (
      <form
        className="h-full self-center grid p-10 w-full max-w-3xl my-6 gap-4 bg-gray-800 shadow-lg rounded-lg"
        onSubmit={(event) => event.preventDefault()}
      >
        <h1 className="font-extrabold text-5xl mb-2 text-center">
          Canvas Rubric Builder
        </h1>
        <div className="flex justify-between items-center">
          {/* Import CSV */}
          <div className={"flex gap-2 items-center"}>
            <CSVImport rubric={rubric} setRubric={setRubric} />

            {/* Export CSV */}
            <CSVExport rubric={rubric} />
            <button
              className="transition-all ease-in-out duration-300 bg-yellow-600 text-white font-bold rounded-lg py-2 px-4 hover:bg-yellow-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              onClick={handleOpenTemplateImport}
              type={"button"}
            >
              Templates
            </button>
          </div>

          <h2 className="text-2xl font-extrabold bg-green-600 text-black py-2 px-4 rounded-lg">
            {maxPoints} {maxPoints === 1 ? "Point" : "Points"}
          </h2>
        </div>

        <input
          type="text"
          placeholder="Rubric title"
          className="rounded p-3 mb-4 hover:bg-gray-200 focus:bg-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 w-full max-w-full text-xl truncate whitespace-nowrap"
          name="rubricTitle"
          id="rubricTitle"
          value={rubric.title}
          onChange={handleRubricTitleChange}
        />

        <div className={"flex justify-end"}>
          <PaletteActionButton
            onClick={removeAllCriteria}
            color={"RED"}
            title={"Clear Form"}
          />
        </div>

        <div
          className="mt-6 grid gap-1
    grid-cols-1
    auto-rows-min
    h-[40vh]
    overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800 p-2"
        >
          {renderCriteriaCards()}
        </div>

        <div className="grid gap-4 mt-6">
          <PaletteActionButton
            title={"Add Criteria"}
            onClick={handleAddCriteria}
            color={"BLUE"}
          />

          <PaletteActionButton
            title={"Save Rubric"}
            onClick={(event) => void handleSubmitRubric(event)}
            color={"GREEN"}
          />
        </div>
      </form>
    );
  };

  /**
   * Helper function to consolidate conditional rendering in the JSX.
   */
  const renderContent = () => {
    if (loading) return <LoadingDots />;
    if (isCanvasBypassed) return renderRubricBuilderForm();
    if (!activeCourse) return <NoCourseSelected />;
    if (!activeAssignment) return <NoAssignmentSelected />;

    return renderRubricBuilderForm();
  };

  const renderBypassButton = () => {
    return (
      <div className={"justify-self-center self-center"}>
        <button
          className={"text-2xl font-bold text-red-500"}
          type={"button"}
          onClick={() => setIsCanvasBypassed((prev) => !prev)} // Toggle bypass
        >
          {isCanvasBypassed ? "Use Canvas API" : "Bypass Canvas API"}
        </button>
      </div>
    );
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen justify-between flex flex-col w-screen bg-gradient-to-b from-gray-900 to-gray-700 text-white font-sans">
        <Header />
        {renderContent()}
        {!isCanvasBypassed && renderBypassButton()}

        {/* ChoiceDialog */}
        <ChoiceDialog
          show={modal.isOpen}
          onHide={closeModal}
          title={modal.title}
          message={modal.message}
          choices={modal.choices}
          excludeCancel={modal.excludeCancel}
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
