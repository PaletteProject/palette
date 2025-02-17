/**
 * Primary project grading view. Opens as a modal over the grading dashboard.
 */

import {
  CanvasGradedSubmission,
  Criteria,
  GroupedSubmissions,
  Rubric,
  Submission,
} from "palette-types";
import { createPortal } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { PaletteActionButton } from "@components";
import { useAssignment, useCourse } from "@context";

type ProjectGradingViewProps = {
  groupName: string;
  submissions: Submission[];
  rubric: Rubric;
  isOpen: boolean;
  onClose: () => void; // event handler defined in GroupSubmissions.tsx
  fetchSubmissions: () => Promise<void>;
  setGradedSubmissionCache: Dispatch<SetStateAction<GroupedSubmissions>>;
};

export function ProjectGradingView({
  groupName,
  submissions,
  rubric,
  isOpen,
  onClose,
  fetchSubmissions,
  setGradedSubmissionCache,
}: ProjectGradingViewProps) {
  if (!isOpen) {
    return null;
  }

  // ratings state to track and update background colors
  const [ratings, setRatings] = useState<{ [key: string]: number | string }>(
    {},
  );

  // group grading checkbox state
  const [checkedCriteria, setCheckedCriteria] = useState<{
    [key: string]: boolean;
  }>({});

  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();

  const BASE_URL = "http://localhost:3000/api";
  const GRADING_ENDPOINT = `/courses/${activeCourse?.id}/assignments/${activeAssignment?.id}/submissions/`;

  /**
   * Wrapper to iteratively submit all graded submissions with existing use fetch hook.
   */
  const submitGrades = async (gradedSubmission: CanvasGradedSubmission) => {
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
      const initialRatings: { [key: string]: number | string } = {};

      submissions.forEach((submission) => {
        /**
         *  If a submission has a rubric assessment (already graded), load in grades from canvas to display.
         *  Otherwise, rating options will render with the default empty value/color theme.
         */
        if (submission.rubricAssessment) {
          for (const [criterionId, assessment] of Object.entries(
            submission.rubricAssessment,
          )) {
            initialRatings[`${submission.id}-${criterionId}`] =
              assessment.points ?? "";
          }
        }
      });

      setRatings(initialRatings);
      console.log(initialRatings);
    }
  }, [isOpen, submissions, rubric]);

  /**
   * Update ratings state on changes.
   */
  const handleRatingChange = (
    submissionId: number,
    criterionId: string,
    value: string,
    applyToGroup: boolean,
  ) => {
    setRatings((prev) => {
      const updatedRatings = {
        ...prev,
        [`${submissionId}-${criterionId}`]: value === "" ? "" : Number(value),
      };

      if (applyToGroup) {
        // iterate through all the ratings and updated the ones with same criterion id
        Object.keys(prev).forEach((key) => {
          const [, existingCriteriaId] = key.split("-"); // don't need the submission id
          if (existingCriteriaId === criterionId) {
            updatedRatings[key] = value === "" ? "" : Number(value);
          }
        });
      }

      return updatedRatings;
    });
  };

  const handleCheckBoxChange = (criterionId: string) => {
    setCheckedCriteria((prev) => ({
      ...prev,
      [criterionId]: !prev[criterionId], // toggle state
    }));
  };

  const handleSaveGrades = async () => {
    const gradedSubmissions: CanvasGradedSubmission[] = submissions.map(
      (submission) => {
        // build rubric assessment object in Canvas format directly (reduces transformations needed later)
        const rubricAssessment: {
          [criterionId: string]: {
            points: number;
            rating_id: string;
            comments: string;
          };
        } = {};

        rubric.criteria.forEach((criterion) => {
          console.log(criterion.id);
          const selectedPoints = ratings[`${submission.id}-${criterion.id}`];
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
     * Store graded submissions in cache
     */

    /**
     * Loop through graded submissions and send each one to the backend.
     */
    for (const gradedSubmission of gradedSubmissions) {
      await submitGrades(gradedSubmission);
    }

    await fetchSubmissions();

    onClose();
  };

  /**
   * Dynamically calculates the drop-down background color.
   */
  const getBackgroundColor = (
    value: number | string,
    criterion: Criteria,
  ): string => {
    if (value === "") return "bg-gray-800"; // Default background color

    const highest = Math.max(...criterion.ratings.map((r) => r.points));
    const lowest = Math.min(...criterion.ratings.map((r) => r.points));

    if (value === highest) return "bg-green-500"; // Green for the highest score
    if (value === lowest) return "bg-red-500"; // Red for the lowest score (even if it's 0)
    return "bg-yellow-500"; // Yellow for anything in between
  };

  const renderGradingPopup = () => {
    return createPortal(
      <div
        className={
          "scroll-auto fixed z-80 inset-0 bg-black bg-opacity-85 flex justify-center items-center text-white"
        }
      >
        <div className="bg-gray-700 p-6 rounded-xl shadow-lg relative w-full grid gap-4 m-4">
          <h1 className="text-4xl text-white font-semibold">{groupName}</h1>
          {renderGradingTable()}
          <div className={"flex gap-4 justify-end"}>
            <PaletteActionButton
              title={"Close"}
              onClick={onClose}
              color={"RED"}
            />
            <PaletteActionButton
              title={"Save Grades"}
              onClick={() => void handleSaveGrades()}
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
                key={criterion.id}
                className="border border-gray-500 px-4 py-2"
              >
                <div className={"flex justify-between"}>
                  <p>{criterion.description} </p>

                  <label className={"flex gap-2 text-sm font-medium"}>
                    Apply Ratings to Group
                    <input
                      type="checkbox"
                      name={`${criterion.id}-checkbox}`}
                      id={`${criterion.id}-checkbox}`}
                      checked={checkedCriteria[criterion.id] || false}
                      onChange={() => handleCheckBoxChange(criterion.id)}
                    />
                  </label>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission: Submission) => (
            <tr key={submission.id}>
              <td className="border border-gray-500 px-4 py-2 flex justify-between">
                <p>{`${submission.user.name} (${submission.user.asurite})`}</p>
              </td>
              {rubric.criteria.map((criterion: Criteria) => (
                <td
                  key={`${submission.id}-${criterion.id}`}
                  className="border border-gray-500 px-4 py-2 text-center"
                >
                  {/* Input field for grading */}
                  <select
                    className={`w-full text-white text-center rounded px-2 py-1 ${getBackgroundColor(
                      ratings[`${submission.id}-${criterion.id}`] ?? "",
                      criterion,
                    )}`}
                    value={ratings[`${submission.id}-${criterion.id}`] ?? ""}
                    onChange={(e) =>
                      handleRatingChange(
                        submission.id,
                        criterion.id,
                        e.target.value,
                        checkedCriteria[criterion.id],
                      )
                    }
                  >
                    <option value="" disabled>
                      Select a Rating
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

  return (
    <div className={"max-h-48 overflow-y-auto"}>{renderGradingPopup()}</div>
  );
}
