import {
  Criteria,
  PaletteGradedSubmission,
  Rubric,
  Submission,
  SubmissionComment,
} from "palette-types";
import { StudentHeaderControls } from "./StudentHeaderControls.tsx";
import { ExistingCriteriaComments } from "./ExistingCriteriaComments.tsx";
import { CriteriaCommentTextArea } from "./CriteriaCommentTextArea.tsx";
import { CriterionHeaderControls } from "./CriterionHeaderControls.tsx";
import { Dispatch, SetStateAction, useState } from "react";

interface GradingTableProps {
  submissions: Submission[];
  rubric: Rubric;
  ratings: Record<string, number | string>;
  setRatings: Dispatch<SetStateAction<Record<string, number | string>>>;
  checkedCriteria: Record<string, boolean>;
  setCheckedCriteria: Dispatch<SetStateAction<Record<string, boolean>>>;
  activeStudentId: number | null;
  setActiveStudentId: Dispatch<SetStateAction<number | null>>;
  feedback: Record<number, string>;
  setFeedback: Dispatch<SetStateAction<Record<number, string>>>;
  existingIndividualFeedback: SubmissionComment[] | null;
  criterionComments: Record<string, string>;
  setCriterionComments: Dispatch<SetStateAction<Record<string, string>>>;
  gradedSubmissionCache: Record<number, PaletteGradedSubmission>;
}

export function GradingTable({
  submissions,
  rubric,
  ratings,
  setRatings,
  checkedCriteria,
  setCheckedCriteria,
  activeStudentId,
  setActiveStudentId,
  feedback,
  setFeedback,
  existingIndividualFeedback,
  criterionComments,
  setCriterionComments,
}: GradingTableProps) {
  const [activeCriterion, setActiveCriterion] = useState<string | null>(null);
  const [showExistingCriterionComment, setShowExistingCriterionComment] =
    useState<boolean>(false);
  const [showCriterionCommentTextArea, setShowCriterionCommentTextArea] =
    useState<boolean>(false);

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
      const newValue = value === "" ? "" : Number(value);

      const updatedRatings = {
        ...prev,
        [`${criterionId}-${submissionId}`]: newValue,
      };

      if (applyToGroup) {
        // iterate through all the ratings and updated the ones with same criterion id
        submissions.forEach((submission) => {
          // iterate over submissions directly rather than existing ratings to ensure we include the entries that
          // haven't been graded yet
          updatedRatings[`${criterionId}-${submission.id}`] = newValue;
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

  return (
    <div
      className={
        "overflow-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800 relative"
      }
    >
      <table className="w-full table-auto border-collapse border border-gray-500 text-left">
        <thead>
          <tr className={"sticky top-0 bg-gray-500"}>
            {/* Header for criteria */}
            <th className="border border-gray-500 px-4 py-2">Criteria</th>
            {/* Group member headers */}
            {submissions.map((submission: Submission) => (
              <th
                key={submission.id}
                className="border border-gray-500 px-4 py-2"
              >
                <StudentHeaderControls
                  submission={submission}
                  activeStudentId={activeStudentId}
                  setActiveStudentId={setActiveStudentId}
                  existingIndividualFeedback={existingIndividualFeedback}
                  feedback={feedback}
                  setFeedback={setFeedback}
                  ratings={ratings}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Each row is a criterion */}
          {rubric.criteria.map((criterion: Criteria) => (
            <tr key={criterion.id}>
              <td className="border border-gray-500 px-4 py-2">
                <div className="flex justify-between items-center gap-6">
                  <p className="flex-1">{criterion.description}</p>
                  {showExistingCriterionComment &&
                    activeCriterion === criterion.id && (
                      <ExistingCriteriaComments
                        criterionId={criterion.id}
                        submissions={submissions}
                        showExistingCriterionComment={
                          showExistingCriterionComment
                        }
                      />
                    )}
                  {showCriterionCommentTextArea &&
                    activeCriterion === criterion.id && (
                      <CriteriaCommentTextArea
                        criterionId={criterion.id}
                        criterionComments={criterionComments}
                        setCriterionComments={setCriterionComments}
                      />
                    )}
                  <label className="flex gap-2 text-sm font-medium whitespace-nowrap items-center">
                    <p>Apply Ratings to Group</p>
                    <input
                      type="checkbox"
                      name={`${criterion.id}-checkbox`}
                      id={`${criterion.id}-checkbox`}
                      checked={checkedCriteria[criterion.id] || false}
                      onChange={() => handleCheckBoxChange(criterion.id)}
                    />
                  </label>
                  <CriterionHeaderControls
                    activeCriterion={activeCriterion}
                    setActiveCriterion={setActiveCriterion}
                    criterion={criterion}
                    setShowCriterionCommentTextArea={
                      setShowCriterionCommentTextArea
                    }
                    setShowExistingCriterionComment={
                      setShowExistingCriterionComment
                    }
                    showExistingCriterionComment={showExistingCriterionComment}
                    showCriterionCommentTextArea={showCriterionCommentTextArea}
                  />
                </div>
              </td>
              {/* For each criterion row, create a cell for each submission */}
              {submissions.map((submission: Submission) => (
                <td
                  key={`${criterion.id}-${submission.id}`}
                  className="w-1/6 border border-gray-500 px-4 py-2 text-center"
                >
                  <select
                    className={`w-full text-white text-center rounded px-2 py-1 ${getBackgroundColor(
                      ratings[`${criterion.id}-${submission.id}`] ?? "",
                      criterion,
                    )}`}
                    value={ratings[`${criterion.id}-${submission.id}`] ?? ""}
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
    </div>
  );
}
