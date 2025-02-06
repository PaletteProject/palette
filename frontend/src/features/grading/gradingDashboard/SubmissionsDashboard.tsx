import { GroupedSubmissions, Rubric } from "palette-types";
import { AssignmentData, GroupSubmissions } from "@features";

export function SubmissionsDashboard({
  rubric,
  submissions,
  fetchSubmissions,
}: {
  rubric: Rubric | undefined;
  submissions: GroupedSubmissions;
  fetchSubmissions: () => Promise<void>;
}) {
  return (
    <div className={"grid justify-start"}>
      <div className={"mb-4"}>
        <h1 className={"text-5xl font-bold p-4"}>Submission Dashboard</h1>
        <AssignmentData rubric={rubric} />
      </div>

      <div
        className={
          "grid gap-4 px-8 m-auto max-w-screen-lg " +
          "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        }
      >
        {Object.entries(submissions).map(([groupId, groupSubmissions]) => {
          // read group name from first entry
          const groupName: string =
            groupSubmissions[0]?.group?.name || "No Group";

          const calculateGradingProgress = () => {
            if (groupSubmissions.length === 0) return 0; // no submissions to grade

            const gradedSubmissionCount = groupSubmissions.reduce(
              (count, submission) => {
                return submission.graded ? count + 1 : count;
              },
              0, // initial value for counter
            );

            return (gradedSubmissionCount / groupSubmissions.length) * 100;
          };
          return (
            <GroupSubmissions
              key={groupId}
              groupName={groupName}
              progress={calculateGradingProgress()}
              submissions={groupSubmissions}
              rubric={rubric!}
              fetchSubmissions={fetchSubmissions}
            />
          );
        })}
      </div>
    </div>
  );
}
