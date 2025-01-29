/**
 * Primary project grading view. Opens as a modal over the grading dashboard.
 */

import { Criteria, Rubric, Submission } from "palette-types";
import { createPortal } from "react-dom";
import { useState } from "react";
import { PaletteActionButton } from "@components";

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

  // ratings state to track and update background colors
  const [ratings, setRatings] = useState<{ [key: string]: number | "" }>({});

  const handleRatingChange = (
    submissionId: number,
    criterionKey: string,
    value: string,
  ) => {
    setRatings((prev) => ({
      ...prev,
      [`${submissionId}-${criterionKey}`]: value === "" ? "" : parseInt(value),
    }));
  };

  /**
   * Dynamically calculates the drop-down background color.
   */
  const getBackgroundColor = (
    value: number | "",
    criterion: Criteria,
  ): string => {
    if (value === "") return "bg-gray-800"; // Default background color
    const highest = criterion.ratings[0]?.points; // First element (highest score)
    const lowest = criterion.ratings[criterion.ratings.length - 1]?.points; // Last element (lowest score)
    if (value === highest) return "bg-green-500"; // Green for the highest score
    if (value === lowest) return "bg-red-500"; // Red for the lowest score
    return "bg-yellow-500"; // Yellow for anything in between
  };

  const renderGradingPopup = () => {
    return createPortal(
      <div
        className={
          "scroll-auto fixed z-80 inset-0 bg-black bg-opacity-85 flex justify-center items-center text-white"
        }
      >
        <div className="bg-gray-700 p-6 rounded-xl shadow-lg relative w-1/2 grid gap-4">
          <h1 className="text-4xl text-white font-semibold mb-3">
            {groupName}
          </h1>
          {renderGradingTable()}
          <PaletteActionButton
            title={"Close"}
            onClick={() => alert("Placeholder: Saving Rubric")}
            color={"RED"}
          />
          <PaletteActionButton
            title={"Save Rubric"}
            onClick={() => alert("Placeholder: Saving Rubric")}
            color={"GREEN"}
          />
        </div>
      </div>,
      document.getElementById("portal-root") as HTMLElement,
    );
  };

  const renderGradingTable = () => {
    console.log(submissions);
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
          {/*Only show submissions that have been submitted and/or graded. */}
          {submissions
            .filter(
              (submission) =>
                submission.workflowState === "submitted" ||
                submission.workflowState === "graded",
            )
            .map((submission: Submission) => (
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
                      className={`w-full text-white text-center rounded px-2 py-1 ${getBackgroundColor(
                        ratings[`${submission.id}-${criterion.key}`] ?? "",
                        criterion,
                      )}`}
                      value={ratings[`${submission.id}-${criterion.key}`] ?? ""}
                      onChange={(e) =>
                        handleRatingChange(
                          submission.id,
                          criterion.key,
                          e.target.value,
                        )
                      }
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
