import { useState } from "react";
import { GroupedSubmissions, Rubric } from "palette-types";
import { AssignmentData, GroupSubmissions } from "@features";

export function SubmissionsDashboard({
  rubric,
  submissions,
}: {
  rubric: Rubric | undefined;
  submissions: GroupedSubmissions;
}) {
  // layout control
  const [isExpandedView, setExpandedView] = useState<boolean>(false);

  return (
    <div>
      <h1 className={"text-5xl font-bold p-4"}>Submission Dashboard</h1>
      <AssignmentData rubric={rubric} />
      <p
        className={
          "font-bold bg-gray-800 px-3 py-1 rounded-xl w-min text-nowrap ml-4 my-4"
        }
      >
        View:{" "}
        <button
          className={"font-semibold text-blue-400"}
          type={"button"}
          onClick={() => {
            setExpandedView(!isExpandedView);
          }}
        >
          {isExpandedView ? "Expanded" : "Simple"}
        </button>
      </p>
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
              isExpanded={isExpandedView}
              submissions={groupSubmissions}
            />
          );
        })}
      </div>
    </div>
  );
}
