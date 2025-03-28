import { GroupedSubmissions, PaletteGradedSubmission } from "palette-types";
import { AssignmentData, GroupSubmissions } from "@features";
import { Dispatch, SetStateAction, useState } from "react";
import { ChoiceDialog, PaletteActionButton } from "@components";
import { useAssignment, useCourse, useRubric } from "@context";
import { useChoiceDialog } from "../../context/DialogContext.tsx";

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
  const { activeRubric } = useRubric();

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
    const firstSubmission = Object.values(savedGrades)[0];

    // Send group comment if it hasn't been sent yet
    if (
      firstSubmission.group_comment &&
      !firstSubmission.group_comment.sent &&
      firstSubmission.group_comment.text_comment !== ""
    ) {
      await fetch(`${BASE_URL}${GRADING_ENDPOINT}${firstSubmission.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_comment: firstSubmission.group_comment }),
      });
    }

    // update sent field to ensure we don't double send the group comment
    setSavedGrades((prev) => ({
      ...prev,
      ...prev[firstSubmission.submission_id],
      group_comment: {
        ...prev[firstSubmission.submission_id].group_comment!,
        sent: true,
      },
    }));

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
          const calculateGradingProgress = () => {
            if (groupSubmissions.length === 0) return 0; // no submissions to grade

            const gradedSubmissionCount = groupSubmissions.reduce(
              (count, submission) => {
                return submission.graded ? count + 1 : count;
              },
              0, // initial value for counter
            );

            return Math.floor(
              (gradedSubmissionCount / groupSubmissions.length) * 100,
            );
          };
          return (
            <GroupSubmissions
              key={`${groupName}}`}
              groupName={groupName}
              progress={calculateGradingProgress()}
              submissions={groupSubmissions}
              rubric={activeRubric}
              fetchSubmissions={fetchSubmissions}
              setSavedGrades={setSavedGrades}
              savedGrades={savedGrades}
            />
          );
        })}
      </div>
      <ChoiceDialog />
    </div>
  );
}
