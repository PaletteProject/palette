/**
 * Primary project grading view. Opens as a modal over the grading dashboard.
 */

import { Criteria, Rubric, Submission } from "palette-types";
import { createPortal } from "react-dom";

export function ProjectGradingView({
  groupName,
  submissions,
  rubric,
  isOpen,
}: {
  groupName: string;
  submissions: Submission[];
  rubric: Rubric;
  isOpen: boolean;
}) {
  if (!isOpen) {
    return null;
  }

  const renderGradingPopup = () => {
    return createPortal(
      <div
        className={
          "scroll-auto fixed z-80 inset-0 bg-black bg-opacity-75 flex justify-center items-center text-white"
        }
      >
        <div className="bg-gray-700 p-6 rounded-xl shadow-lg relative w-1/2">
          <h1 className="text-4xl text-white font-semibold mb-3">
            {groupName}
          </h1>
          {renderGroupMembers()}
          {renderCriteria()}
        </div>
      </div>,
      document.getElementById("portal-root") as HTMLElement,
    );
  };

  const renderGroupMembers = () => {
    return (
      <div>
        {submissions.map((submission: Submission) => (
          <div key={submission.id} className={"mb-4"}>
            <h2>{`${submission.user.name} (${submission.user.asurite})`}</h2>
          </div>
        ))}
      </div>
    );
  };

  const renderCriteria = () => {
    return (
      <div>
        {rubric.criteria.map((criterion: Criteria) => (
          <div key={criterion.key}>
            <h2>{criterion.description}</h2>
          </div>
        ))}
      </div>
    );
  };

  return <div>{renderGradingPopup()}</div>;
}
