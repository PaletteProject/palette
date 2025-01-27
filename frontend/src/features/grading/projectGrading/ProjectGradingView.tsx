/**
 * Primary project grading view. Opens as a modal over the grading dashboard.
 */

import { Criteria, Rubric, Submission } from "palette-types";

export function ProjectGradingView({
  groupName,
  submissions,
  rubric,
}: {
  groupName: string;
  submissions: Submission[];
  rubric: Rubric;
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

          {rubric.criteria.map((criteria: Criteria) => (
            <div key={criteria.key}>
              <p>{criteria.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return <div>{renderGradingPopup()}</div>;
}
