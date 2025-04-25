import { useState } from "react";
import { GroupedSubmissions, PaletteGradedSubmission } from "palette-types";
import { GroupSubmissions } from "@features";
import { ChoiceDialog, PaletteActionButton } from "@components";
import { useChoiceDialog } from "../../../context/DialogContext.tsx";
import { GradingProvider } from "../../../context/GradingContext.tsx";
import { aggregateOfflineGrades } from "./aggregateOfflineGrades";
import { submitGradesToCanvas } from "./submitGradesToCanvas";

type OfflineDashboardProps = {
  courseId: string;
  assignmentId: string;
  submissions: GroupedSubmissions;
};

export function OfflineDashboard({
  courseId,
  assignmentId,
  submissions,
}: OfflineDashboardProps) {
  const { openDialog, closeDialog } = useChoiceDialog();

  const [savedGrades, setSavedGrades] = useState<
    Record<number, PaletteGradedSubmission>
  >({});

  const courseNameMap = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("courseNameMap") || "{}"
      ) as Record<string, string>;
    } catch {
      return {} as Record<string, string>;
    }
  })();
  
  const assignmentNameMap = (() => {
    try {
      return JSON.parse(
        localStorage.getItem(`assignmentNameMap_${courseId}`) || "{}"
      ) as Record<string, string>;
    } catch {
      return {} as Record<string, string>;
    }
  })();
  
  const courseName = courseNameMap[courseId] || `Course ${courseId}`;
  const assignmentName =
    assignmentNameMap[assignmentId] || `Assignment ${assignmentId}`;
  
  const handleSubmitGrades = async () => {
    const token = localStorage.getItem("accessToken") || "";

    const grades = aggregateOfflineGrades(courseId, assignmentId);

    if (Object.keys(grades).length === 0) {
      alert(" No offline grades found to submit.");
      return;
    }

    try {
      await submitGradesToCanvas(courseId, assignmentId, grades, token);
      alert("Offline grades successfully submitted to Canvas!");
    } catch (err) {
      console.error("Error submitting grades:", err);
      alert("Failed to submit grades. See console.");
    }
  };

  const handleClick = () => {
    openDialog({
      title: "Submit Offline Grades to Canvas?",
      message:
        "This will push all offline grades for this assignment to Canvas. Are you sure?",
      excludeCancel: false,
      buttons: [
        {
          label: "Yes, submit!",
          action: () => {
            void handleSubmitGrades();
            closeDialog();
          },
          autoFocus: true,
        },
        {
          label: "Cancel",
          action: () => closeDialog(),
          color: "RED",
          autoFocus: false,
        },
      ],
    });
  };

  return (
    <div className="grid justify-start">
      <div className="grid gap-2 mb-4 p-4">
        <h1 className="text-5xl font-bold">Offline Submission Dashboard</h1>
        <div className="text-white mb-2">
          <h2 className="text-2xl font-semibold">{courseName}</h2>
          <p className="text-lg">{assignmentName}</p>
        </div>
        <div className="flex gap-2">
          <PaletteActionButton
            color="GREEN"
            title="Submit Offline Grades to Canvas"
            onClick={handleClick}
          />
        </div>
      </div>

      <div className="grid gap-4 px-8 m-auto max-w-screen-lg grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {Object.entries(submissions).map(([groupName, groupSubmissions]) => {
          const gradedCount = groupSubmissions.reduce(
            (count, s) => (s.graded ? count + 1 : count),
            0,
          );
          const progress = Math.floor(
            (gradedCount / groupSubmissions.length) * 100,
          );

          return (
            <GradingProvider key={groupName}>
              <GroupSubmissions
                groupName={groupName}
                submissions={groupSubmissions}
                progress={progress}
                savedGrades={savedGrades}
                setSavedGrades={setSavedGrades}
                fetchSubmissions={() => Promise.resolve()}
              />
            </GradingProvider>
          );
        })}
      </div>
      <ChoiceDialog />
    </div>
  );
}
