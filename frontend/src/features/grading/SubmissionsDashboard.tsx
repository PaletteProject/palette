import {
  GroupedSubmissions,
  PaletteGradedSubmission,
  Submission,
} from "palette-types";
import { AssignmentData, GroupSubmissions } from "@/features";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { ChoiceDialog, PaletteActionButton } from "@/components";
import { useAssignment, useChoiceDialog, useCourse } from "@/context";
import { GradingProvider } from "@/context/GradingContext.tsx";

type SubmissionDashboardProps = {
  submissions: GroupedSubmissions;
  fetchSubmissions: () => Promise<void>;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

export function SubmissionsDashboard({
  submissions,
  fetchSubmissions,
  setLoading,
}: SubmissionDashboardProps) {
  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();

  const { openDialog, closeDialog } = useChoiceDialog();

  const BASE_URL = "http://localhost:3000/api";
  const GRADING_ENDPOINT = `/courses/${activeCourse?.id}/assignments/${activeAssignment?.id}/submissions/`;

  const [savedGrades, setSavedGrades] = useState<
    Record<number, PaletteGradedSubmission>
  >({});

  /**
   * Submit all graded submissions in the cache
   */
  const submitGrades = async () => {
    // submit all submissions (group comments are already sent) only individual comments get sent here
    for (const gradedSubmission of Object.values(savedGrades)) {
      console.log("test graded sub", gradedSubmission);
      await fetch(`${BASE_URL}${GRADING_ENDPOINT}${gradedSubmission.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gradedSubmission),
      });
    }

    setLoading(true);
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
    const local = savedGrades[submission.user.id];
    const rubric = local?.rubric_assessment || submission.rubricAssessment;

    return Object.values(rubric).every(
      (entry) => entry.points && !Number.isNaN(entry.points),
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
        className={
          "grid gap-4 px-8 m-auto max-w-screen-lg " +
          "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        }
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
