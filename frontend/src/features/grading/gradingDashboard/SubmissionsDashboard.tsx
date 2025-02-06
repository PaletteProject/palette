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
    <div>
      <h1 className={"text-5xl font-bold p-4"}>Submission Dashboard</h1>
      <AssignmentData rubric={rubric} />

      <div
        className={
          " grid grid-flow-col-dense auto-rows-fr grid-cols-auto " +
          " gap-4 px-8 max-w-screen max-h-full m-auto justify-start"
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
