import { CanvasGradedSubmission, Rubric, Submission } from "palette-types";
import { ProgressBar } from "@features";
import { ProjectGradingView } from "./ProjectGradingView.tsx";
import { Dispatch, SetStateAction, useState } from "react";
import { PaletteActionButton } from "@components";
import { useRubric } from "@context";

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
  const { activeRubric } = useRubric();

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

  const calculateGroupAverage = (submissions: Submission[]): number => {
    const { total, count } = submissions.reduce(
      (groupAcc, submission) => {
        // use reduce to aggregate scores for a single submission
        const { total: subTotal, count: subCount } = Object.values(
          submission.rubricAssessment,
        ).reduce(
          (acc, assessment) => ({
            total: acc.total + assessment.points,
            count: acc.count + 1,
          }),
          { total: 0, count: 0 }, // initial accumulator for a submission
        );

        // add submission total to group totals
        return {
          total: groupAcc.total + subTotal,
          count: groupAcc.count + subCount,
        };
      },
      { total: 0, count: 0 }, // initial accumulator for the group
    );
    return count > 0 ? total / count : 0;
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
          Average: {`${calculateGroupAverage(submissions)} Points`}
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
