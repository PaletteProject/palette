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
  // graded submissions to be sent to Canvas
  const [gradedSubmissionCache, setGradedSubmissionCache] = useState<
    PaletteGradedSubmission[]
  >([]);

  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();
  const { activeRubric } = useRubric();

  const { openDialog, closeDialog } = useChoiceDialog();

  const BASE_URL = "http://localhost:3000/api";
  const GRADING_ENDPOINT = `/courses/${activeCourse?.id}/assignments/${activeAssignment?.id}/submissions/`;

  /**
   * Submit all graded submissions in the cache
   */
  const submitGrades = async (gradedSubmissions: PaletteGradedSubmission[]) => {
    // if the first submission has a group comment, update the group comment for all submissions
    // ATTENTION: This code ofcourse assumes that the groupFeedback will always be added to the first graded submission.
    // Not a bad assumption, but if it were to change, this code would break.
    // This is being set in ProjectGradingView.tsx in handleSaveGrades()

    if (gradedSubmissions[0].group_comment) {
      await fetch(
        `${BASE_URL}${GRADING_ENDPOINT}${gradedSubmissions[0].user.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(gradedSubmissions[0]),
        },
      );
      gradedSubmissions[0].group_comment.sent = true; // set it to sent so that it doesn't get sent again
    }

    // submit all submissions (group comments are already sent) only individual comments get sent here
    for (const gradedSubmission of gradedSubmissions) {
      await fetch(`${BASE_URL}${GRADING_ENDPOINT}${gradedSubmission.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gradedSubmission),
      });
    }

    setLoading(true);
    await fetchSubmissions(); // refresh submissions
    setLoading(false);
    setGradedSubmissionCache([]); // clear submission cache
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
            void submitGrades(gradedSubmissionCache);
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
              setGradedSubmissionCache={setGradedSubmissionCache}
              gradedSubmissionCache={gradedSubmissionCache}
            />
          );
        })}
      </div>
      <ChoiceDialog />
    </div>
  );
}
