import { PaletteGradedSubmission, Submission } from "palette-types";
import { ProgressBar } from "@features";
import { Dispatch, SetStateAction, useState } from "react";
import { PaletteActionButton } from "@components";
import { useRubric } from "@context";
import { ProjectGradingView } from "./projectGradingComponents/ProjectGradingView.tsx";
import { useGradingContext } from "../../context/GradingContext.tsx";
import { calculateGroupAverage } from "../../utils/SubmissionUtils.ts";

interface GroupSubmissionsProps {
  groupName: string;
  progress: number;
  submissions: Submission[];
  fetchSubmissions: () => Promise<void>;
  setSavedGrades: Dispatch<
    SetStateAction<Record<number, PaletteGradedSubmission>>
  >;
  savedGrades: Record<number, PaletteGradedSubmission>;
}

export function GroupSubmissions({
  groupName,
  progress,
  submissions,
  setSavedGrades,
  savedGrades,
}: GroupSubmissionsProps) {
  const [isGradingViewOpen, setGradingViewOpen] = useState(false);

  const { activeRubric } = useRubric();
  const { gradedSubmissionCache } = useGradingContext();

  const handleGradingViewClose = (
    cache: Record<number, PaletteGradedSubmission>,
  ) => {
    // add current in progress grades to main grading cache to be sent to canvas
    setSavedGrades((prevGrades) => {
      return {
        ...prevGrades,
        ...cache,
      };
    });

    setGradingViewOpen(false);
  };

  const toggleGradingView = () => {
    if (!activeRubric) {
      alert(
        "Assignment does not have a rubric for grading. Create a rubric and try again!",
      );
      return;
    }
    setGradingViewOpen(true);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 p-4 border-2 rounded-2xl border-gray-500 shadow-xl bg-gray-900 border-opacity-35">
        {/* Group Header */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-bold">{groupName}</h1>
          <PaletteActionButton
            color="BLUE"
            title="Grade"
            onClick={toggleGradingView}
            disabled={activeRubric.id === ""}
          />
        </div>

        {/* Progress Bar Section */}
        <div className="w-full mt-1">
          <ProgressBar progress={progress} />
        </div>
        <div className={"text-center"}>
          Average Score: {`${calculateGroupAverage(gradedSubmissionCache)}`}
        </div>
      </div>

      <ProjectGradingView
        isOpen={isGradingViewOpen}
        groupName={groupName}
        submissions={submissions}
        onClose={handleGradingViewClose}
        savedGrades={savedGrades}
        setSavedGrades={setSavedGrades}
      />
    </div>
  );
}
