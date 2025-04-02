/**
 * Rubric Builder view.
 */
import { ReactElement, useEffect } from "react";
import TemplateUpload from "./TemplateUpload.tsx";
import {
  Dialog,
  Footer,
  Header,
  LoadingDots,
  NoAssignmentSelected,
  NoCourseSelected,
} from "@/components";

import { Rubric } from "palette-types";

import { useChoiceDialog, useSettings } from "@/context";
import { createRubric } from "@/utils";
import { useRubricBuilder, useTemplate } from "@/hooks";

import { RubricForm } from "./RubricForm.tsx";

interface RubricBuilderMainProps {
  hotSwapActive?: boolean;
}

export function RubricBuilderMain({
  hotSwapActive = false,
}: RubricBuilderMainProps): ReactElement {
  const {
    activeRubric,
    setActiveRubric,
    activeCourse,
    activeAssignment,
    getRubric,
    isOfflineMode,
    setIsOfflineMode,
    setHasExistingRubric,
    loading,
    setLoading,
    setIsNewRubric,
  } = useRubricBuilder();

  const { settings } = useSettings();
  const { openDialog, closeDialog } = useChoiceDialog();
  const { templateInputActive, setTemplateInputActive } = useTemplate();

  useEffect(() => {
    if (!activeCourse || !activeAssignment || hotSwapActive) return;

    setLoading(true);

    const loadRubric = async () => {
      if (!activeAssignment.rubricId) {
        handleNewRubric();
        return;
      }

      const response = await getRubric();
      if (!response) {
        setLoading(false);
        return;
      }

      const exists = response.success || false;
      setHasExistingRubric(exists);
      setIsNewRubric(!exists);
      setActiveRubric(response.data as Rubric);
      setLoading(false);

      if (exists) {
        handleExistingRubric();
      } else {
        handleNewRubric();
      }
    };

    void loadRubric();
  }, [activeCourse, activeAssignment, hotSwapActive]);

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

  /**
   * Effect to load a default rubric if canvas api is bypassed
   */
  useEffect(() => {
    if (hotSwapActive) return;
    if (isOfflineMode && !activeRubric) {
      setActiveRubric(createRubric(settings));
    }
    if (!activeRubric) return;
    localStorage.setItem("rubric", JSON.stringify(activeRubric));
  }, [isOfflineMode, activeRubric]);

  /**
   * Helper function to consolidate conditional rendering in the JSX.
   */
  const renderContent = () => {
    if (loading) return <LoadingDots />;
    if (isOfflineMode)
      return (
        <RubricForm
          templateInputActive={templateInputActive}
          setTemplateInputActive={setTemplateInputActive}
        />
      );
    if (!activeCourse) return <NoCourseSelected />;
    if (!activeAssignment) return <NoAssignmentSelected />;

    return (
      <RubricForm
        templateInputActive={templateInputActive}
        setTemplateInputActive={setTemplateInputActive}
      />
    );
  };

  const renderOfflineToggleButton = () => {
    return (
      <div className={"justify-self-center self-center"}>
        <button
          className={"text-2xl font-bold text-red-500"}
          type={"button"}
          onClick={() => setIsOfflineMode((prev) => !prev)} // Toggle bypass
        >
          {isOfflineMode ? "Use Canvas API" : "Enable Offline Mode"}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen justify-between flex flex-col w-full  bg-gradient-to-b from-gray-900 to-gray-700 text-white font-sans">
      <Header />
      <div className={"px-48 flex justify-center"}>{renderContent()}</div>
      {!isOfflineMode && renderOfflineToggleButton()}

      {/* Template Import Dialog */}
      <Dialog
        isOpen={templateInputActive}
        onClose={() => setTemplateInputActive(false)}
        title={"Import Template:"}
      >
        <TemplateUpload closeImportCard={() => setTemplateInputActive(false)} />
      </Dialog>
      {/* Sticky Footer with Gradient */}
      <Footer />
    </div>
  );
}
