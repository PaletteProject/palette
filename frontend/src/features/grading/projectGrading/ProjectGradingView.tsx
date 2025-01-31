/**
 * Primary project grading view. Opens as a modal over the grading dashboard.
 */

import { Criteria, Rubric, Submission } from "palette-types";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { PaletteActionButton } from "@components";
import { useAssignment, useCourse } from "@context";

export function ProjectGradingView({
  groupName,
  submissions,
  rubric,
  isOpen,
  onClose,
}: {
  groupName: string;
  submissions: Submission[];
  rubric: Rubric;
  isOpen: boolean;
  onClose: () => void; // event handler defined in GroupSubmissions.tsx
}) {
  if (!isOpen) {
    return null;
  }

  // ratings state to track and update background colors
  const [ratings, setRatings] = useState<{ [key: string]: number | "" }>({});

  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();

  const BASE_URL = "http://localhost:3000/api";
  const GRADING_ENDPOINT = `/courses/${activeCourse?.id}/assignments/${activeAssignment?.id}/submissions/`;

  /**
   * Wrapper to iteratively submit all graded submissions with existing use fetch hook.
   */
  const submitGrades = async (gradedSubmission: GradedSubmission) => {
    /**
     * Fetch hook to submit graded rubric.
     */
    await fetch(`${BASE_URL}${GRADING_ENDPOINT}${gradedSubmission.user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gradedSubmission),
    });
  };

  /**
   * Initialize ratings when grading modal opens. Maps criterion directly from rubric.
   */
  useEffect(() => {
    if (isOpen) {
      const initialRatings: { [key: string]: number | "" } = {};
      submissions.forEach((submission) => {
        rubric.criteria.forEach((criterion) => {
          initialRatings[`${submission.id}-${criterion.key}`] = ""; // start with an empty rating (will eventually
          // change to grab current rating if it exists)
        });
      });
      setRatings(initialRatings);
      console.log(submissions);
    }
  }, [isOpen, submissions, rubric]);

  /**
   * Update ratings state on changes.
   */
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

  type GradedSubmission = {
    submission_id: number;
    user: { id: number; name: string; asurite: string };
    rubric_assessment: {
      [p: string]: { points: number; rating_id: string; comments: string };
    };
  };

  const handleSubmitGrades = async () => {
    const gradedSubmissions: GradedSubmission[] = submissions.map(
      (submission) => {
        // build rubric assessment object in Canvas format directly (reduces transformations needed later)
        const rubricAssessment: {
          [key: string]: {
            points: number;
            rating_id: string;
            comments: string;
          };
        } = {};

        rubric.criteria.forEach((criterion) => {
          const selectedPoints = ratings[`${submission.id}-${criterion.key}`];
          const selectedRating = criterion.ratings.find(
            (rating) => rating.points === selectedPoints,
          );

          if (selectedRating) {
            rubricAssessment[criterion.id] = {
              // criterion from canvas API will always have an ID
              points: selectedRating.points,
              rating_id: selectedRating.id, // rating ID from Canvas API
              comments: "", // placeholder for comments
            };
          }
        });

        return {
          submission_id: submission.id,
          user: submission.user,
          rubric_assessment: rubricAssessment,
        };
      },
    );

    console.log("Submitting graded submissions: ");
    console.log(gradedSubmissions);

    /**
     * Loop through graded submissions and send eachone to the backend.
     */
    for (const gradedSubmission of gradedSubmissions) {
      await submitGrades(gradedSubmission);
    }

    onClose();
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
          <h1 className="text-4xl text-white font-semibold">{groupName}</h1>
          {renderGradingTable()}
          <div className={"flex gap-4 justify-end"}>
            <PaletteActionButton
              title={"Close"}
              onClick={onClose}
              color={"RED"}
            />
            <PaletteActionButton
              title={"Submit Grades"}
              onClick={() => void handleSubmitGrades()}
              color={"GREEN"}
            />
          </div>
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
