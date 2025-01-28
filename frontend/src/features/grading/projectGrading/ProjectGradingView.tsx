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
          {renderGradingTable()}
        </div>
      </div>,
      document.getElementById("portal-root") as HTMLElement,
    );
  };

  const renderGradingTable = () => {
    return (
      <table className="w-full table-auto border-collapse border border-gray-500 text-left">
        <thead>
          <tr>
            <th className="border border-gray-500 px-4 py-2">Group Member</th>
            {rubric.criteria.map((criterion: Criteria) => (
              <th
                key={criterion.key}
                className="border border-gray-500 px-4 py-2"
              >
                {criterion.description}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission: Submission) => (
            <tr key={submission.id}>
              <td className="border border-gray-500 px-4 py-2">
                {`${submission.user.name} (${submission.user.asurite})`}
              </td>
              {rubric.criteria.map((criterion: Criteria) => (
                <td
                  key={`${submission.id}-${criterion.key}`}
                  className="border border-gray-500 px-4 py-2 text-center"
                >
                  {/* Input field for grading */}
                  <select
                    className="w-full bg-gray-800 text-white text-center rounded px-2 py-1"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select a rating
                    </option>
                    {criterion.ratings.map((rating) => (
                      <option value={rating.points} key={rating.key}>
                        {`${rating.description} - ${rating.points} Points`}
                      </option>
                    ))}
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return <div>{renderGradingPopup()}</div>;
}
