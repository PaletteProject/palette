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
import { createTemplate } from "src/utils/templateFactory.ts";
import {
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

import { Criteria, PaletteAPIResponse, Rubric, Template } from "palette-types";
import { CSVExport, CSVImport } from "@features";
import { AnimatePresence, motion } from "framer-motion";

import { useChoiceDialog } from "../../context/DialogContext.tsx";
import { useSettings } from "../../context/SettingsContext.tsx";
import { createCriterion, createRubric } from "@utils";
import { useRubricBuilder } from "../../hooks/useRubricBuilder.ts";
import { useTemplate } from "../../hooks/useTemplate.ts";

export function RubricBuilderMain(): ReactElement {
  const {
    activeRubric,
    setActiveRubric,
    activeCourse,
    activeAssignment,
    getRubric,
    postRubric,
    putRubric,
    activeCriterionIndex,
    setActiveCriterionIndex,
    isCanvasBypassed,
    setIsCanvasBypassed,
    hasExistingRubric,
    setHasExistingRubric,
    loading,
    setLoading,
    isNewRubric,
    setIsNewRubric,
  } = useRubricBuilder();

  const { settings } = useSettings();

  const { openDialog, closeDialog } = useChoiceDialog();

  const {
    updatingTemplate,
    importingTemplate,
    templateInputActive,
    setImportingTemplate,
    setUpdatingTemplate,
    setTemplateInputActive,
  } = useTemplate();

  const closePopUp = useCallback(
    () => setPopUp((prevPopUp) => ({ ...prevPopUp, isOpen: false })),
    [],
  );

  const [popUp, setPopUp] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    if (!activeCourse || !activeAssignment) return;
    if (hasExistingRubric) handleExistingRubric();
    if (!hasExistingRubric) handleNewRubric();
  }, [hasExistingRubric]);

  /* this is for updating the existing templates with most
  recent version of the criteria before saving the rubric
  in case any criterion are updated after initial template selection
  */
  const { fetchData: putTemplate } = useFetch("/templates", {
    method: "PUT",
    body: JSON.stringify(importingTemplate),
  });

  /**
   * Fires when user selects an assignment that doesn't have a rubric id associated with it.
   */
  const handleNewRubric = () => {
    const newRubric = createRubric(settings);
    setActiveRubric(newRubric);

    openDialog({
      excludeCancel: true,
      title: "Build a New Rubric",
      message:
        "The active assignment does not have an associated rubric. Let's build one!",
      buttons: [{ label: "OK", action: () => closeDialog(), autoFocus: true }],
    });
    setLoading(false);
    setHasExistingRubric(false);
    setIsNewRubric(true);
  };

  useEffect(() => {
    const updateTemplate = async () => {
      if (!importingTemplate) {
        console.warn("No template provided for update.");
        return;
      }
      const response = await putTemplate();
      if (response.success) {
        console.log("template usage count updated successfully");
      } else {
        console.error("error updating template", response.error);
      }
    };
    void updateTemplate();
  }, [importingTemplate]);

  useEffect(() => {
    if (!activeCourse || !activeAssignment) return;

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
      setActiveRubric(response.data as Rubric);
      setLoading(false);
    };

    void checkRubricExists();
  }, [activeCourse, activeAssignment]);

  /**
   * Rubric change event handlers
   */

  /**
   * If user selects replace existing rubric, the program creates a new rubric for the user to edit.
   *
   * On "Save Rubric", the program sends a POST request to add the new rubric to the associated assignment on Canvas.
   */
  const startNewRubric = () => {
    closeDialog();
    const newRubric = createRubric(settings);
    setActiveRubric(newRubric); // set the active rubric to a fresh rubric
  };

  /**
   * Fires when a selected assignment already has a rubric.
   *
   * User has the option to either overwrite the rubric with a fresh start or edit the existing rubric.
   */
  const handleExistingRubric = () => {
    if (!activeRubric) return;

    openDialog({
      excludeCancel: true,
      title: "Existing Rubric Detected",
      message: `A rubric with the title "${activeRubric.title}" already exists for the active assignment. How would you like to proceed?`,
      buttons: [
        {
          label: "Edit Rubric",
          action: () => closeDialog(),
          autoFocus: true,
        },
        {
          autoFocus: false,
          label: "Create New Rubric",
          action: () => startNewRubric(),
        },
      ],
    });
  };

  const handleUpdateAllTemplateCriteria = async (): Promise<void> => {
    const criteriaOnATemplate: Criteria[] = [];
    activeRubric?.criteria.forEach((criterion) => {
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

    for (const template of existingTemplates) {
      setUpdatingTemplate(template);
      const response = await putTemplate();

      if (response.success) {
        console.log("template updated successfully", updatingTemplate);
      } else {
        console.error("error updating template", response.error);
      }
    }
  };

  const handleSubmitRubric = async (event: MouseEvent): Promise<void> => {
    event.preventDefault();
    console.log("submitting rubric");
    console.log(activeRubric);
    if (!activeRubric || !activeCourse || !activeAssignment) return;

    setLoading(true);

    try {
      const response: PaletteAPIResponse<unknown> = isNewRubric
        ? await postRubric()
        : await putRubric();

      if (response.success) {
        openDialog({
          excludeCancel: true,
          title: "Success!",
          message: `${activeRubric.title} ${isNewRubric ? "created" : "updated"}!`,
          buttons: [
            {
              autoFocus: true,
              label: "Radical",
              action: () => {
                closeDialog();
                void handleUpdateAllTemplateCriteria();
              },
            },
          ],
        });
      } else {
        openDialog({
          excludeCancel: true,
          title: "Error!",
          message: `An error occurred: ${response.error || "Unknown error"}`,
          buttons: [
            { autoFocus: false, label: "Close", action: () => closeDialog() },
          ],
        });
      }
    } catch (error) {
      console.error("Error handling rubric submission:", error);
      openDialog({
        excludeCancel: true,
        title: "Error!",
        message: `An unexpected error occurred: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
        buttons: [
          { autoFocus: true, label: "Close", action: () => closeDialog() },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRubricTitleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    setActiveRubric({
      ...activeRubric,
      title: event.target.value,
    });
  };

  /**
   * Calculate rubric max points whenever rubric criterion changes. Uses memoization to avoid re-rendering the
   * function everytime, improving performance.
   *
   * Defaults to 0 if no criterion is defined.
   */
  const maxPoints = useMemo(() => {
    if (!activeRubric) return;

    return (
      activeRubric.criteria.reduce(
        (sum, criterion) =>
          isNaN(criterion.pointsPossible)
            ? sum
            : sum + criterion.pointsPossible,
        0, // init sum to 0
      ) ?? 0 // fallback value if criterion is undefined
    );
  }, [activeRubric?.criteria]);

  /**
   * Callback function to trigger the creation of a new criterion on the rubric.
   * @param event user clicks "add criteria"
   */
  const handleAddCriteria = (event: MouseEvent) => {
    event.preventDefault();
    if (!activeRubric) return;
    const newCriteria = [...activeRubric.criteria, createCriterion(settings)];
    setActiveRubric({ ...activeRubric, criteria: newCriteria });
    setActiveCriterionIndex(newCriteria.length - 1);
  };

  /**
   * Callback function to remove a target criterion from the rubric. Triggers confirmation modal to avoid any
   * accidental data loss.
   * @param index of the target criterion within the rubric
   * @param criterion target criterion object, used for modal details.
   */
  const handleRemoveCriterion = (index: number, criterion: Criteria) => {
    if (!activeRubric) return; // do nothing if there is no active rubric

    const deleteCriterion = () => {
      const newCriteria = [...activeRubric.criteria];
      newCriteria.splice(index, 1);
      setActiveRubric({ ...activeRubric, criteria: newCriteria });
    };

    openDialog({
      excludeCancel: false,
      title: "Confirm Criterion Removal",
      message: `Are you sure you want to remove ${criterion.description}? This action is (currently) not reversible.`,
      buttons: [
        {
          autoFocus: true,
          label: "Destroy it!",
          action: () => {
            deleteCriterion();
            closeDialog();
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
    if (!activeRubric) return;
    const newCriteria = [...activeRubric.criteria];
    newCriteria[index] = criterion; // update the criterion with changes;
    setActiveRubric({ ...activeRubric, criteria: newCriteria }); // update rubric to have new criteria
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
    if (!activeRubric) return;
    if (event.over) {
      const oldIndex = activeRubric.criteria.findIndex(
        (criterion) => criterion.key === event.active.id,
      );
      const newIndex = activeRubric.criteria.findIndex(
        (criterion) => criterion.key === event.over!.id, // assert not null for type safety
      );

      const updatedCriteria = [...activeRubric.criteria];
      const [movedCriterion] = updatedCriteria.splice(oldIndex, 1);
      updatedCriteria.splice(newIndex, 0, movedCriterion);

      setActiveRubric({ ...activeRubric, criteria: updatedCriteria });
    }
  };

  const handleImportTemplate = (template: Template) => {
    const updatedTemplate = {
      ...template,
      usageCount: template.usageCount + 1,
      lastUsed: new Date().toISOString(),
    };

    setUpdatingTemplate(updatedTemplate);
    if (!activeRubric) return;

    const currentCriteria = activeRubric.criteria;
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
      const duplicateDescriptions = duplicates
        .map((criterion) => criterion.description)
        .join(", ");
      setPopUp({
        isOpen: true,
        title: "Oops!",
        message: `Looks like you already imported this one. Duplicate criteria: ${duplicateDescriptions}`,
      });
      return;
    }

    setActiveRubric({
      ...activeRubric,
      criteria: [...currentCriteria, ...unique],
    });
    setImportingTemplate(updatedTemplate);
  };

  /**
   * Render a card for each criterion in the active rubric.
   *
   * The Sortable Context wrapper allows the drag and drop to dynamically apply sorting. The Animate Presence wrapper
   * with the motion.div enable the transitions in and out.
   */
  const renderCriteriaCards = () => {
    if (!activeRubric) return;
    return (
      <SortableContext
        items={activeRubric.criteria.map((criterion) => criterion.key)}
        strategy={verticalListSortingStrategy}
      >
        <AnimatePresence>
          {activeRubric.criteria.map((criterion, index) => (
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
    if (isCanvasBypassed && !activeRubric) {
      setActiveRubric(createRubric(settings));
    }
    if (!activeRubric) return;
    localStorage.setItem("rubric", JSON.stringify(activeRubric));
  }, [isCanvasBypassed, activeRubric]);

  const deleteAllCriteria = () => {
    const newCriteria: Criteria[] = []; // empty array to reset all criteria
    setActiveRubric({ ...activeRubric, criteria: newCriteria });
  };

  const removeAllCriteria = () => {
    openDialog({
      excludeCancel: false,
      title: "Clear All Criteria?",
      message: "Are you sure you want to remove all criteria on the form?",
      buttons: [
        {
          autoFocus: true,
          label: "Purge Them All",
          action: () => {
            deleteAllCriteria();
            closeDialog();
          },
        },
      ],
    });
  };

  /**
   * Helper function to wrap the builder JSX.
   */
  const renderRubricBuilderForm = () => {
    if (!activeRubric) return <p>No Active Rubric</p>;

    return (
      <form
        className=" w-full self-center grid p-10 my-6 gap-4 bg-gray-800 shadow-lg rounded-lg"
        onSubmit={(event) => event.preventDefault()}
      >
        <h1 className="font-extrabold text-5xl mb-2 text-center">
          Canvas Rubric Builder
        </h1>
        <div className="flex justify-between items-center">
          {/* Import/Export CSV */}
          <div className={"flex gap-2 items-center"}>
            <CSVImport />
            <CSVExport />
            <PaletteActionButton
              title={"Templates"}
              onClick={handleOpenTemplateImport}
            />
          </div>

          <h2 className="text-2xl font-extrabold bg-blue-600 text-white py-2 px-4 rounded-lg">
            {maxPoints} {maxPoints === 1 ? "Point" : "Points"}
          </h2>
        </div>

        <textarea
          placeholder="Rubric title"
          className="rounded p-3 mb-4 hover:bg-gray-200 focus:bg-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 w-full max-w-full text-xl"
          name="rubricTitle"
          id="rubricTitle"
          value={activeRubric.title}
          onChange={handleRubricTitleChange}
          rows={1}
        />

        <div
          className="mt-6 grid gap-1
          grid-cols-1
          auto-rows-min
          h-[40vh]
          overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800 p-2"
        >
          {renderCriteriaCards()}
        </div>

        <div className="flex gap-4  justify-self-end">
          <PaletteActionButton
            title={"Add Criteria"}
            onClick={handleAddCriteria}
            color={"BLUE"}
          />
          <PaletteActionButton
            onClick={removeAllCriteria}
            color={"RED"}
            title={"Clear Form"}
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
      <div className="min-h-screen justify-between flex flex-col w-screen  bg-gradient-to-b from-gray-900 to-gray-700 text-white font-sans">
        <Header />
        <div className={"px-48 flex justify-center"}>{renderContent()}</div>
        {!isCanvasBypassed && renderBypassButton()}

        <ChoiceDialog />

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
