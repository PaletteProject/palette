import { Rubric, Submission } from "palette-types";
import { ProgressBar } from "@features";
import { ProjectGradingView } from "../projectGrading/ProjectGradingView.tsx";
import { useState } from "react";

export function GroupSubmissions({
  groupName,
  progress,
  submissions,
  rubric,
  fetchSubmissions,
}: {
  groupName: string;
  progress: number;
  submissions: Submission[];
  rubric: Rubric;
  fetchSubmissions: () => Promise<void>;
}) {
  // grading popup state (submissions are already filtered by group)
  const [isGradingViewOpen, setGradingViewOpen] = useState<boolean>(false);

  const handleGradingViewClose = () => {
    setGradingViewOpen(false);
  };

  const toggleGradingView = () => {
    if (!rubric) {
      alert(
        "Assignment does not have a rubric for grading. Create a rubric and try again!",
      );
      return;
    }

    setGradingViewOpen(true);
  };

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
          onClick={toggleGradingView}
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

  return (
    <div
      className={`max-w-md flex flex-col gap-4 m-2 p-6 border border-gray-400 border-opacity-35 shadow-xl rounded-2xl overflow-hidden`}
    >
      {renderGroupHeader()}
      <ProjectGradingView
        isOpen={isGradingViewOpen}
        groupName={groupName}
        submissions={submissions}
        rubric={rubric}
        onClose={handleGradingViewClose}
        fetchSubmissions={fetchSubmissions}
      />
    </div>
  );
}
