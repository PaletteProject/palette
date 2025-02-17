/**
 * Primary project grading view. Opens as a modal over the grading dashboard.
 */

import {
  CanvasGradedSubmission,
  Criteria,
  Rubric,
  Submission,
} from "palette-types";
import { createPortal } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ChoiceDialog, PaletteActionButton } from "@components";
import { useChoiceDialog } from "../../context/DialogContext.tsx";

type ProjectGradingViewProps = {
  groupName: string;
  submissions: Submission[];
  rubric: Rubric;
  isOpen: boolean;
  onClose: () => void; // event handler defined in GroupSubmissions.tsx
  setGradedSubmissionCache: Dispatch<SetStateAction<CanvasGradedSubmission[]>>;
  gradedSubmissionCache: CanvasGradedSubmission[];
};

export function ProjectGradingView({
  groupName,
  submissions,
  rubric,
  isOpen,
  onClose,
  setGradedSubmissionCache,
  gradedSubmissionCache,
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

  const { openDialog, closeDialog } = useChoiceDialog();

  /**
   * Initialize ratings when grading modal opens. Maps criterion directly from rubric.
   */
  useEffect(() => {
    if (isOpen) {
      const initialRatings: { [key: string]: number | string } = {};

      console.log("THE CACHE");
      console.log(gradedSubmissionCache);

      // process the cached submissions, prioritizing the latest in progress grades over what Canvas current has saved.
      gradedSubmissionCache.forEach((gradedSubmission) => {
        const { submission_id, rubric_assessment } = gradedSubmission;

        if (rubric_assessment) {
          for (const [criterionId, assessment] of Object.entries(
            rubric_assessment,
          )) {
            initialRatings[`${submission_id}-${criterionId}`] =
              assessment.points ?? "";
          }
        }
      });

      // Process the submissions from canvas and merge with cached submissions to fill in missing data
      submissions.forEach((submission) => {
        if (submission.rubricAssessment) {
          for (const [criterionId, assessment] of Object.entries(
            submission.rubricAssessment,
          )) {
            // avoid overwriting data from cache
            const key = `${submission.id}-${criterionId}`;
            if (!(key in initialRatings)) {
              initialRatings[`${submission.id}-${criterionId}`] =
                assessment.points ?? "";
            }
          }
        }
      });

      setRatings(initialRatings);
      console.log("Initialized Ratings:", initialRatings);
    }
  }, [isOpen, submissions, rubric, gradedSubmissionCache]);

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

      console.log("CHANGED RATINGS");
      console.log(updatedRatings);
      return updatedRatings;
    });
  };

  const handleCheckBoxChange = (criterionId: string) => {
    setCheckedCriteria((prev) => ({
      ...prev,
      [criterionId]: !prev[criterionId], // toggle state
    }));
  };

  const handleSaveGrades = () => {
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

    /**
     * Store graded submissions in cache
     */

    setGradedSubmissionCache((prev) => prev.concat(gradedSubmissions));
    console.log("Caching submissions ");
    console.log(gradedSubmissions);
    console.log("end cache");

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

  const handleClickCloseButton = () => {
    openDialog({
      title: "Lose Grading Progress?",
      message:
        "Closing the grading view before saving will discard any changes made since the last save or" +
        " submission.",
      buttons: [
        {
          label: "Lose it all!",
          action: () => {
            onClose();
            closeDialog();
          },
          autoFocus: true,
          color: "RED",
        },
        {
          label: "Save Progress",
          action: () => {
            handleSaveGrades();
            closeDialog();
          },
          autoFocus: false,
          color: "BLUE",
        },
      ],
    });
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
              onClick={() => handleClickCloseButton()}
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
    <div className={"max-h-48 overflow-y-auto"}>
      {renderGradingPopup()}
      <ChoiceDialog />
    </div>
  );
}
