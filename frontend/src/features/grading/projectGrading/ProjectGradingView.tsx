/**
 * Primary project grading view. Opens as a modal over the grading dashboard.
 */

import { Submission } from "palette-types";

export function ProjectGradingView({
  groupName,
  submissions,
}: {
  groupName: string;
  submissions: Submission[];
}) {
  const renderGradingPopup = () => {
    return (
      <div>
        <p>{groupName}</p>
        <div>
          {submissions.map((submission: Submission) => (
            <div key={submission.id}>
              <p>{submission.id}</p>
              <p>{submission.user.asurite}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return <div>{renderGradingPopup()}</div>;
}
