import {
  GroupedSubmissions,
  PaletteGradedSubmission,
  Submission,
} from "palette-types";
import { AssignmentData, GroupSubmissions } from "@/features";
import { Dispatch, SetStateAction, useMemo } from "react";
import { ChoiceDialog, PaletteActionButton } from "@/components";
import { useAssignment, useChoiceDialog, useCourse } from "@/context";
import { GradingProvider } from "@/context/GradingContext.tsx";
import { cn } from "@/lib/utils.ts";

type SubmissionDashboardProps = {
  submissions: GroupedSubmissions;
  fetchSubmissions: () => Promise<void>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  savedGrades: Record<number, PaletteGradedSubmission>;
  setSavedGrades: Dispatch<
    SetStateAction<Record<number, PaletteGradedSubmission>>
  >;
};

export function SubmissionsDashboard({
  submissions,
  fetchSubmissions,
  setLoading,
  savedGrades,
  setSavedGrades,
}: SubmissionDashboardProps) {
  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();

  const { openDialog, closeDialog } = useChoiceDialog();

  const BASE_URL = "http://localhost:3000/api";
  const GRADING_ENDPOINT = `/courses/${activeCourse?.id}/assignments/${activeAssignment?.id}/submissions/`;

  /**
   * Submit all graded submissions in the cache
   */
  const submitGrades = async () => {
    setLoading(true);

    for (const gradedSubmission of Object.values(savedGrades)) {
      if (gradedSubmission.user?.id) {
        await fetch(
          `${BASE_URL}${GRADING_ENDPOINT}${gradedSubmission.user.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(gradedSubmission),
          },
        );
      }
    }
    setLoading(false);

    await fetchSubmissions(); // refresh submissions
    setLoading(false);
    setSavedGrades({}); // clear submission cache
  };

  const handleClickSubmitGrades = () => {
    openDialog({
      title: "Submit Grades to Canvas?",
      message: "Clicking yes will post grades to Canvas.",
      excludeCancel: true,
      buttons: [
        {
          label: "Send them!",
          action: () => {
            void submitGrades();
            closeDialog();
          },
          autoFocus: true,
        },
        {
          label: "Cancel",
          action: () => closeDialog(),
          autoFocus: false,
          color: "RED",
        },
      ],
    });
  };

  const isGraded = (submission: Submission) => {
    if (!submission) return false; // skip empty entries

    const rubric = submission.rubricAssessment; // fallback to canvas data

    if (!rubric) return false;

    return Object.values(rubric).every(
      (entry) => entry && entry.points >= 0 && !Number.isNaN(entry.points),
    );
  };

  return (
    <div className={"grid justify-start"}>
      <div className={"grid gap-2 mb-4 p-4"}>
        <h1 className={"text-5xl font-bold"}>Submission Dashboard</h1>
        <AssignmentData />
        <div className={"flex"}>
          <PaletteActionButton
            color={"GREEN"}
            title={"Submit Grades to Canvas"}
            onClick={() => handleClickSubmitGrades()}
          />
        </div>
      </div>

      <div
        className={cn(
          "grid gap-4 px-8 max-w-screen-lg",
          "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
        )}
      >
        {Object.entries(submissions).map(([groupName, groupSubmissions]) => {
          const progress = useMemo(() => {
            if (!groupSubmissions || groupSubmissions.length === 0) return 0;
            const gradedCount = groupSubmissions.filter(isGraded).length;
            return Math.floor((gradedCount / groupSubmissions.length) * 100);
          }, [groupSubmissions, savedGrades]);
          return (
            <GradingProvider key={`${groupName}}`}>
              <GroupSubmissions
                groupName={groupName}
                progress={progress}
                submissions={groupSubmissions}
                fetchSubmissions={fetchSubmissions}
                setSavedGrades={setSavedGrades}
                savedGrades={savedGrades}
              />
            </GradingProvider>
          );
        })}
      </div>
      <ChoiceDialog />
    </div>
  );
}
