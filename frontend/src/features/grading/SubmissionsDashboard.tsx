import {
  CanvasGradedSubmission,
  GroupedSubmissions,
  Rubric,
} from "palette-types";
import { AssignmentData, GroupSubmissions } from "@features";
import { Dispatch, SetStateAction, useState } from "react";
import { PaletteActionButton } from "@components";
import { useAssignment, useCourse } from "@context";

type SubmissionDashboardProps = {
  rubric: Rubric | undefined;
  submissions: GroupedSubmissions;
  fetchSubmissions: () => Promise<void>;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

export function SubmissionsDashboard({
  rubric,
  submissions,
  fetchSubmissions,
  setLoading,
}: SubmissionDashboardProps) {
  // graded submissions to be sent to Canvas
  const [gradedSubmissionCache, setGradedSubmissionCache] = useState<
    CanvasGradedSubmission[]
  >([]);

  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();
  const BASE_URL = "http://localhost:3000/api";
  const GRADING_ENDPOINT = `/courses/${activeCourse?.id}/assignments/${activeAssignment?.id}/submissions/`;

  /**
   * Submit all graded submissions in the cache
   */
  const submitGrades = async (gradedSubmissions: CanvasGradedSubmission[]) => {
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

  return (
    <div className={"grid justify-start"}>
      <div className={"grid gap-2 mb-4 p-4"}>
        <h1 className={"text-5xl font-bold"}>Submission Dashboard</h1>
        <AssignmentData rubric={rubric} />
        <div className={"flex"}>
          <PaletteActionButton
            color={"PURPLE"}
            title={"Submit Grades to Canvas"}
            onClick={() => void submitGrades(gradedSubmissionCache)}
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
              rubric={rubric!}
              fetchSubmissions={fetchSubmissions}
              setGradedSubmissionCache={setGradedSubmissionCache}
            />
          );
        })}
      </div>
    </div>
  );
}
