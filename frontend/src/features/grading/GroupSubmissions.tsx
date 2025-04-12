import { Submission } from "palette-types";

import { useEffect, useMemo, useState } from "react";
import { PaletteActionButton, ProgressBar } from "@/components";
import { SavedGrades, useChoiceDialog, useRubric } from "@/context";
import { ProjectGradingView } from "./projectGradingComponents/ProjectGradingView.tsx";
import { useGradingContext } from "@/context/GradingContext.tsx";
import { calculateCanvasGroupAverage, calculateGroupAverage } from "@/utils";
import { cn } from "@/lib/utils.ts";

interface GroupSubmissionsProps {
  groupName: string;
  progress: number;
  submissions: Submission[];
  fetchSubmissions: () => Promise<void>;
}

export function GroupSubmissions({
  groupName,
  progress,
  submissions,
}: GroupSubmissionsProps) {
  const [isGradingViewOpen, setGradingViewOpen] = useState(false);
  const [groupAverageScore, setGroupAverageScore] = useState(() => {
    if (submissions.length === 0) return 0;
    return calculateCanvasGroupAverage(submissions);
  });

  const { activeRubric } = useRubric();
  const { gradedSubmissionCache } = useGradingContext();

  // track submission IDs for easy lookups
  const submissionIds = useMemo(
    () => submissions.map((s) => s.id),
    [submissions],
  );

  const [initMode, setInitMode] = useState<"none" | "canvas" | "restore">(
    "none",
  );
  const { openDialog, closeDialog } = useChoiceDialog();

  const toggleGradingView = () => {
    if (!activeRubric) {
      alert(
        "Assignment does not have a rubric for grading. Create a rubric and try again!",
      );
      return;
    }

    const stored = localStorage.getItem("gradedSubmissionCache");
    const parsedCache = stored ? (JSON.parse(stored) as SavedGrades) : {};
    const hasUnsavedGrades = submissionIds.some(
      (id) => parsedCache[id] !== undefined,
    );

    if (hasUnsavedGrades) {
      openDialog({
        title: "Unsaved Grades Detected",
        message:
          "You have unsaved grades. Do you want to restore them or start fresh from Canvas?",
        excludeCancel: true,
        buttons: [
          {
            label: "Restore",
            color: "GREEN",
            action: () => {
              setInitMode("restore");
              setGradingViewOpen(true);
              closeDialog();
            },
            autoFocus: true,
          },
          {
            label: "Load Canvas Data",
            color: "YELLOW",
            action: () => {
              setInitMode("canvas");
              localStorage.removeItem("gradedSubmissionCache");
              setGradingViewOpen(true);
              closeDialog();
            },
            autoFocus: false,
          },
        ],
      });
    } else {
      setInitMode("canvas");
      setGradingViewOpen(true);
    }
  };

  useEffect(() => {
    // update group avg score whenever cache changes
    if (Object.values(gradedSubmissionCache).length !== 0) {
      setGroupAverageScore(
        calculateGroupAverage(gradedSubmissionCache, submissionIds),
      );
    } else {
      // use average score from Canvas submissions
      setGroupAverageScore(calculateCanvasGroupAverage(submissions));
    }
  }, [gradedSubmissionCache]);

  const hasDraftGrades = submissionIds.some(
    (id) => gradedSubmissionCache[id] !== undefined,
  );

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex flex-col gap-2 p-4 border-2 rounded-2xl",
          "border-gray-500 shadow-xl bg-gray-900",
          "border-opacity-35",
        )}
      >
        {/* Group Header */}
        <div className="flex items-center justify-between gap-4 relative">
          <h1 className="text-lg font-bold">{groupName}</h1>
          {hasDraftGrades && (
            <span className="text-xs text-yellow-300 italic absolute -top-10 -left-1">
              In Progress
            </span>
          )}
          <PaletteActionButton
            color="BLUE"
            title="Grade"
            onClick={toggleGradingView}
            disabled={!activeRubric?.id}
          />
        </div>
        <div>
          <ProgressBar value={progress} />
        </div>
        <div className={"text-center"}>
          Average Score: {`${groupAverageScore.toFixed(2)}`}
        </div>
      </div>

      <ProjectGradingView
        isOpen={isGradingViewOpen}
        initMode={initMode}
        groupName={groupName}
        submissions={submissions}
        onClose={() => {
          setInitMode("none");
          setGradingViewOpen(false);
        }}
      />
    </div>
  );
}
