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
import { PaletteBrush, PaletteEye } from "@components";

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

  const [ratings, setRatings] = useState<Record<string, number | string>>({});
  const [groupFeedback, setGroupFeedback] = useState<string>("");
  const [showGroupFeedbackSection, setShowGroupFeedbackSection] =
    useState<boolean>(false);
  // group grading checkbox state
  const [checkedCriteria, setCheckedCriteria] = useState<{
    [key: string]: boolean;
  }>({});
  const [activeCriterionComment, setActiveCriterionComment] = useState<
    string | null
  >(null);
  const [activeIndividualFeedback, setActiveIndividualFeedback] = useState<
    number | null
  >(null);
  const [criterionComments, setCriterionComments] = useState<
    Record<string, string>
  >({});
  const [individualFeedbacks, setIndividualFeedbacks] = useState<
    Record<number, string>
  >({});
  const [showExistingGroupComments, setShowExistingGroupComments] =
    useState<boolean>(false);

  const { openDialog, closeDialog } = useChoiceDialog();
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);
  const [updatedIndividualFeedback, setUpdatedIndividualFeedback] = useState<
    Record<number, { id: number; authorName: string; comment: string }>
  >({});

  /**
   * Initialize ratings when grading modal opens. Maps criterion directly from rubric.
   */
  useEffect(() => {
    if (isOpen) {
      const initialRatings: Record<string, number | string> = {};

      // process the cached submissions, prioritizing the latest in progress grades over what Canvas current has saved.
      gradedSubmissionCache.forEach((gradedSubmission) => {
        const { submission_id, rubric_assessment } = gradedSubmission;

        if (rubric_assessment) {
          for (const [criterionId, assessment] of Object.entries(
            rubric_assessment
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
            submission.rubricAssessment
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

      console.log("submissions", submissions);
    }
  }, [isOpen, submissions, rubric, gradedSubmissionCache]);

  const getExistingGroupComments = (submissions: Submission[]) => {
    let allSubmissionComments = [];
    let seenComments = new Set<string>();
    let existingGroupComments = [];

    for (const submission of submissions) {
      let submissionComments = submission.comments;
      for (const comment of submissionComments) {
        if (seenComments.has(comment.comment)) {
          existingGroupComments.push(comment);
        } else {
          seenComments.add(comment.comment);
        }
      }
      allSubmissionComments.push(...submissionComments);
    }

    // setGroupFeedback(allSubmissionComments.join("\n"));
    console.log("Existing group comments:", existingGroupComments);
    return existingGroupComments;
  };

  const getExistingIndividualComments = (
    submissions: Submission[],
    submissionId: number
  ) => {
    const existingGroupComments = getExistingGroupComments(submissions);
    const studentsComments = submissions.find(
      (submission) => submission.id === submissionId
    )?.comments;

    const existingIndividualComments = studentsComments?.filter(
      (comment) =>
        !existingGroupComments.some(
          (existingComment) => existingComment.comment === comment.comment
        )
    );
    return existingIndividualComments;
  };

  const renderExistingGroupComments = () => {
    return (
      <div className="flex flex-col gap-2">
        {getExistingGroupComments(submissions).length > 0 ? (
          <>
            <h2 className="text-lg font-bold">Existing Group Comments</h2>
            <ul className="list-disc list-inside">
              {getExistingGroupComments(submissions).map((comment) => (
                <li key={comment.id}>{comment.comment}</li>
              ))}
            </ul>
          </>
        ) : (
          <p>No existing group comments</p>
        )}
      </div>
    );
  };

  const renderExistingIndividualFeedback = (submissionId: number) => {
    if (activeStudentId !== submissionId) return null; // Only render if the student is active

    const existingComments = getExistingIndividualComments(
      submissions,
      submissionId
    );

    const handleCommentClick = (comment: {
      id: number;
      authorName: string;
      comment: string;
    }) => {
      setIndividualFeedbacks((prev) => ({
        ...prev,
        [submissionId]: comment.comment,
      }));
      setUpdatedIndividualFeedback((prev) => ({
        ...prev,
        [submissionId]: {
          id: Number(comment.id),
          authorName: comment.authorName,
          comment: comment.comment,
        },
      }));
    };

    return (
      <div className="w-full">
        {existingComments ? (
          <>
            {existingComments.length > 0 ? (
              <>
                <h2 className="text-lg font-bold">Existing Comments</h2>
                <ul className="list-disc list-inside">
                  {existingComments.map((comment) => (
                    <li
                      key={comment.comment}
                      onClick={() => {
                        handleCommentClick(comment);
                        setActiveIndividualFeedback(submissionId);
                      }}
                      className="cursor-pointer hover:underline"
                    >
                      {comment.comment}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>No existing comments for this student</p>
            )}
          </>
        ) : (
          <p>No existing comments for this student</p> // TODO: figure out how to remove this. Need this because existingComments might be undefined
        )}
      </div>
    );
  };

  /**
   * Update ratings state on changes.
   */
  const handleRatingChange = (
    submissionId: number,
    criterionId: string,
    value: string,
    applyToGroup: boolean
  ) => {
    setRatings((prev) => {
      const newValue = value === "" ? "" : Number(value);

      const updatedRatings = {
        ...prev,
        [`${submissionId}-${criterionId}`]: newValue,
      };

      if (applyToGroup) {
        // iterate through all the ratings and updated the ones with same criterion id
        submissions.forEach((submission) => {
          // iterate over submissions directly rather than existing ratings to ensure we include the entries that
          // haven't been graded yet
          updatedRatings[`${submission.id}-${criterionId}`] = newValue;
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
            (rating) => rating.points === selectedPoints
          );

          if (selectedRating) {
            rubricAssessment[criterion.id] = {
              // criterion from canvas API will always have an ID
              points: selectedRating.points,
              rating_id: selectedRating.id, // rating ID from Canvas API
              comments: criterionComments[criterion.id] || "", // placeholder for comments
            };
          }
        });

        let individualComment = undefined;
        if (individualFeedbacks[submission.id]) {
          individualComment = {
            text_comment: individualFeedbacks[submission.id],
            group_comment: false as const,
          };
        }

        return {
          submission_id: submission.id,
          user: submission.user,
          individual_comment: individualComment,
          group_comment: undefined, // Assume there are no group comments. Check for it and add it to the first submission outside of map below.
          rubric_assessment: rubricAssessment,
        };
      }
    );

    // Add a group comment to the first submission if it exists
    // This should affect all submissions on canvas side.
    // No need to add it to all submissions.
    if (groupFeedback !== "") {
      gradedSubmissions[0].group_comment = {
        text_comment: groupFeedback,
        group_comment: true as const,
        sent: false,
      };
    }

    /**
     * Store graded submissions in cache
     */

    setGradedSubmissionCache((prev) => prev.concat(gradedSubmissions));

    onClose();
  };

  /**
   * Dynamically calculates the drop-down background color.
   */
  const getBackgroundColor = (
    value: number | string,
    criterion: Criteria
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
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl text-white font-semibold">{groupName}</h1>
              <PaletteBrush
                onClick={() =>
                  setShowGroupFeedbackSection(!showGroupFeedbackSection)
                }
                title="Group Feedback"
              />
              <PaletteEye
                onClick={() =>
                  setShowExistingGroupComments(!showExistingGroupComments)
                }
              />
            </div>
          </div>
          {showExistingGroupComments && renderExistingGroupComments()}
          {showGroupFeedbackSection && renderGroupFeedbackSection()}
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
      document.getElementById("portal-root") as HTMLElement
    );
  };

  const renderGroupFeedbackSection = () => {
    return (
      <div className="flex flex-col gap-2">
        <textarea
          className="w-1/3 min-h-12 max-h-32 text-black font-bold rounded px-2 py-1 bg-gray-300 overflow-auto 
          scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
          onChange={(e) => setGroupFeedback(e.target.value)}
          value={groupFeedback}
          placeholder="Enter feedback for the group..."
        />
      </div>
    );
  };

  const renderIndividualFeedbackSection = (submissionId: number) => {
    return (
      <textarea
        className="w-full min-h-12 max-h-32 text-black font-bold rounded px-2 py-1 bg-gray-300 overflow-auto 
          scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
        onChange={(e) =>
          setIndividualFeedbacks((prev) => ({
            ...prev,
            [submissionId]: e.target.value,
          }))
        }
        value={individualFeedbacks[submissionId] || ""}
        placeholder="Enter feedback for the individual..."
      />
    );
  };

  const renderCriterionCommentSection = (criterionId: string) => {
    return (
      <div className="flex flex-col gap-2 ">
        <textarea
          className="w-full min-h-12 max-h-32 text-black rounded px-2 py-1 bg-gray-300 overflow-auto 
          scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
          onChange={(e) =>
            setCriterionComments((prev) => ({
              ...prev,
              [criterionId]: e.target.value,
            }))
          }
          value={criterionComments[criterionId] || ""}
          placeholder="Enter comment for the criterion..."
        />
      </div>
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
                  <PaletteBrush
                    onClick={() =>
                      setActiveCriterionComment(
                        activeCriterionComment === criterion.id
                          ? null
                          : criterion.id
                      )
                    }
                    title="Add Criterion Comment"
                  />
                </div>
                {activeCriterionComment === criterion.id &&
                  renderCriterionCommentSection(criterion.id)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission: Submission) => (
            <tr key={submission.id}>
              <td className="border border-gray-500 py-2 flex justify-center">
                <div className="flex flex-col w-full items-center gap-2 mx-4">
                  <div className="flex items-center gap-4 pr-4">
                    <p>{`${submission.user.name} (${submission.user.asurite})`}</p>
                    <PaletteBrush
                      onClick={() =>
                        setActiveIndividualFeedback(
                          activeIndividualFeedback === submission.id
                            ? null
                            : submission.id
                        )
                      }
                      title="Individual Feedback"
                    />
                    <PaletteEye
                      onClick={() => handleStudentClick(submission.id)}
                    />
                  </div>
                  {renderExistingIndividualFeedback(submission.id)}
                  {activeIndividualFeedback === submission.id &&
                    renderIndividualFeedbackSection(submission.id)}
                </div>
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
                      criterion
                    )}`}
                    value={ratings[`${submission.id}-${criterion.id}`] ?? ""}
                    onChange={(e) =>
                      handleRatingChange(
                        submission.id,
                        criterion.id,
                        e.target.value,
                        checkedCriteria[criterion.id]
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

  const handleStudentClick = (submissionId: number) => {
    setActiveStudentId((prev) => (prev === submissionId ? null : submissionId));
  };

  return (
    <div className={"max-h-48 overflow-y-auto"}>
      {renderGradingPopup()}
      <ChoiceDialog />
    </div>
  );
}
