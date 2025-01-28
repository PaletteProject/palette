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
        <p>{groupName}</p>
        <div>
          {submissions.map((submission: Submission) => (
            <p key={submission.id}>{submission.user.asurite}</p>
          ))}

          {rubric.criteria.map((criteria: Criteria) => (
            <div key={criteria.key}>
              <p>{criteria.description}</p>
            </div>
          ))}
        </div>
      </div>,
      document.getElementById("portal-root") as HTMLElement,
    );
  };

  return <div>{renderGradingPopup()}</div>;
}
