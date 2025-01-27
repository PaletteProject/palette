import { Submission } from "palette-types";
import { IndividualSubmission, ProgressBar } from "@features";
import { ProjectGradingView } from "../projectGrading/ProjectGradingView.tsx";

export function GroupSubmissions({
  groupName,
  progress,
  isExpanded,
  submissions,
}: {
  groupName: string;
  progress: number;
  isExpanded: boolean;
  submissions: Submission[];
}) {
  const renderGroupHeader = () => {
    return (
      <div
        className={
          "grid gap-4 grid-cols-3 grid-rows-2 items-center justify-between"
        }
      >
        <h1 className={"text-4xl font-bold col-span-2"}>{groupName}</h1>
        <button
          type={"button"}
          className={
            "bg-white rounded-xl px-2 py-1 relative top-1 hover:bg-blue-400 flex col-start-3 justify-center"
          }
          onClick={() => alert(`Grading submissions from ${groupName}!`)}
          title={"Grade this Group"}
        >
          <p className={"text-black text-2xl font-bold "}>Grade</p>
        </button>

        <div className={"col-span-3"}>
          <ProgressBar progress={progress} />
        </div>
      </div>
    );
  };

  const renderSubmissions = () => {
    return (
      <div className={"mt-2 grid gap-2"}>
        {submissions.map((submission) => (
          <IndividualSubmission submission={submission} key={submission.id} />
        ))}
      </div>
    );
  };

  const renderTestGradingView = () => {
    return (
      <ProjectGradingView groupName={groupName} submissions={submissions} />
    );
  };

  return (
    <div
      className={`max-w-md flex flex-col gap-4 m-2 p-6 border border-gray-400 border-opacity-35 shadow-xl rounded-2xl overflow-hidden`}
    >
      {renderGroupHeader()}
      {isExpanded && renderSubmissions()}
      {renderTestGradingView()}
    </div>
  );
}
