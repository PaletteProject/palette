import { CanvasGradedSubmission, Rubric, Submission } from "palette-types";
import { ProgressBar } from "@features";
import { ProjectGradingView } from "./ProjectGradingView.tsx";
import { Dispatch, SetStateAction, useState } from "react";
import { PaletteActionButton } from "@components";

interface GroupSubmissionsProps {
  groupName: string;
  progress: number;
  submissions: Submission[];
  rubric: Rubric;
  fetchSubmissions: () => Promise<void>;
  setGradedSubmissionCache: Dispatch<SetStateAction<CanvasGradedSubmission[]>>;
  gradedSubmissionCache: CanvasGradedSubmission[];
}

export function GroupSubmissions({
  groupName,
  progress,
  submissions,
  rubric,
  setGradedSubmissionCache,
  gradedSubmissionCache,
}: GroupSubmissionsProps) {
  const [isGradingViewOpen, setGradingViewOpen] = useState(false);

  const handleGradingViewClose = () => setGradingViewOpen(false);

  const toggleGradingView = () => {
    if (!rubric) {
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
          />
        </div>

        {/* Progress Bar Section */}
        <div className="w-full mt-1">
          <ProgressBar progress={progress} />
        </div>
      </div>

      <ProjectGradingView
        isOpen={isGradingViewOpen}
        groupName={groupName}
        submissions={submissions}
        rubric={rubric}
        onClose={handleGradingViewClose}
        setGradedSubmissionCache={setGradedSubmissionCache}
        gradedSubmissionCache={gradedSubmissionCache}
      />
    </div>
  );
}
