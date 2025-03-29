import { CSVExport, CSVImport } from "@features";
import { PaletteActionButton } from "@components";
import CriteriaList from "./CriteriaList.tsx";
import { Criteria, PaletteAPIResponse, Template } from "palette-types";
import {
  ChangeEvent,
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useMemo,
} from "react";
import { useChoiceDialog } from "@context";
import { createCriterion } from "@utils";
import { useSettings } from "../../context/SettingsContext.tsx";
import { useRubricBuilder } from "../../hooks/useRubricBuilder.ts";
import { createTemplate } from "../../utils/templateFactory.ts";
import { useTemplate } from "../../hooks/useTemplate.ts";

// useTemplate() returns different instances of state >:( so we have to pass it here from rubric main
interface RubricFormProps {
  templateInputActive: boolean;
  setTemplateInputActive: Dispatch<SetStateAction<boolean>>;
}

export function RubricForm({
  templateInputActive,
  setTemplateInputActive,
}: RubricFormProps) {
  const { settings } = useSettings();
  const { openDialog, closeDialog } = useChoiceDialog();
  const {
    activeRubric,
    setActiveRubric,
    activeCourse,
    activeAssignment,
    postRubric,
    putRubric,
    activeCriterionIndex,
    setActiveCriterionIndex,
    setLoading,
    isNewRubric,
  } = useRubricBuilder();

  const {
    updatingTemplate,
    setUpdatingTemplate,
    putTemplate,
    importingTemplate,
  } = useTemplate();

  useEffect(() => {
    const updateTemplate = async () => {
      if (!importingTemplate) return;

      const response = await putTemplate();
      if (response.success) {
        console.log("template usage count updated successfully");
      } else {
        console.error("error updating template", response.error);
      }
    };
    void updateTemplate();
  }, [importingTemplate]);

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

  const removeAllCriteria = () => {
    const newCriteria: Criteria[] = []; // empty array to reset all criteria
    setActiveRubric({ ...activeRubric, criteria: newCriteria });
  };

  const onRemoveAllCriteria = () => {
    openDialog({
      excludeCancel: false,
      title: "Confirm Criterion Removal",
      message: `Are you sure you want to remove all criteria? This action is permanent.`,
      buttons: [
        {
          autoFocus: true,
          label: "Purge them all!",
          action: () => {
            removeAllCriteria();
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
    console.log("active template: ", templateInputActive);
    if (!templateInputActive) {
      setTemplateInputActive(true);
    }
  };

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
            onClick={(event) => handleOpenTemplateImport(event)}
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
        <CriteriaList
          criteria={activeRubric.criteria}
          activeCriterionIndex={activeCriterionIndex}
          onUpdateCriteria={handleUpdateCriterion}
          onRemoveCriteria={handleRemoveCriterion}
          setActiveCriterionIndex={setActiveCriterionIndex}
        />
      </div>

      <div className="flex gap-4  justify-self-end">
        <PaletteActionButton
          title={"Add Criteria"}
          onClick={handleAddCriteria}
          color={"BLUE"}
        />
        <PaletteActionButton
          onClick={onRemoveAllCriteria}
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
}
