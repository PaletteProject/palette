/**
 * Primary project grading view. Opens as a modal over the grading dashboard.
 */

import {
  Criteria,
  PaletteGradedSubmission,
  Rubric,
  Submission,
} from "palette-types";
import { createPortal } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  ChoiceDialog,
  PaletteActionButton,
  PaletteBrush,
  PaletteEye,
} from "@components";
import { useChoiceDialog } from "../../context/DialogContext.tsx";
import { calculateSubmissionTotal } from "../../utils/SubmissionUtils.ts";

type ProjectGradingViewProps = {
  groupName: string;
  submissions: Submission[];
  rubric: Rubric;
  isOpen: boolean;
  onClose: () => void; // event handler defined in GroupSubmissions.tsx
  setGradedSubmissionCache: Dispatch<SetStateAction<PaletteGradedSubmission[]>>;
  gradedSubmissionCache: PaletteGradedSubmission[];
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
  const [criterionComments, setCriterionComments] = useState<
    Record<string, string>
  >({});
  const [individualFeedbacks, setIndividualFeedbacks] = useState<
    Record<number, string>
  >({});

  // Existing feedback states
  const [existingIndividualFeedback, setExistingIndividualFeedback] = useState<
    { id: number; authorName: string; comment: string }[] | null
  >(null);

  // UI state
  const [showExistingGroupFeedback, setShowExistingGroupFeedback] =
    useState<boolean>(false);

  const [showExistingIndividualFeedback, setShowExistingIndividualFeedback] =
    useState<boolean>(false);

  const [showExistingCriterionComment, setShowExistingCriterionComment] =
    useState<boolean>(false);

  // Active student and criterion states
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);
  const [activeCriterion, setActiveCriterion] = useState<string | null>(null);

  // Text area states
  const [showIndividualFeedbackTextArea, setShowIndividualFeedbackTextArea] =
    useState<boolean>(false);
  const [showGroupFeedbackTextArea, setShowGroupFeedbackTextArea] =
    useState<boolean>(false);
  const [showCriterionCommentTextArea, setShowCriterionCommentTextArea] =
    useState<boolean>(false);
  // group grading checkbox state
  const [checkedCriteria, setCheckedCriteria] = useState<{
    [key: string]: boolean;
  }>({});

  const { openDialog, closeDialog } = useChoiceDialog();

  const existingCriterionComments = submissions[0].rubricAssessment
    ? Object.entries(submissions[0].rubricAssessment).reduce(
        (acc, [criterionId, criterion]) => {
          acc[criterionId] = criterion.comments;
          return acc;
        },
        {} as Record<string, string>,
      )
    : {};

  const setInitialGroupFlags = () => {
    const newFlags = rubric.criteria.reduce(
      (acc, criterion) => {
        acc[criterion.id] = criterion.isGroupCriterion;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    setCheckedCriteria(newFlags);
  };

  /**
   * Initialize project grading view.
   */
  useEffect(() => {
    if (isOpen) {
      setInitialGroupFlags();

      const initialRatings: Record<string, number | string> = {};

      // process the cached submissions, prioritizing the latest in progress grades over what Canvas current has saved.
      gradedSubmissionCache.forEach((gradedSubmission) => {
        const { submission_id, rubric_assessment } = gradedSubmission;

        if (rubric_assessment) {
          for (const [criterionId, assessment] of Object.entries(
            rubric_assessment,
          )) {
            initialRatings[`${criterionId}-${submission_id}`] =
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
            const key = `${criterionId}-${submission.id}`;
            if (!(key in initialRatings)) {
              initialRatings[`${criterionId}-${submission.id}`] =
                assessment.points ?? "";
            }
          }
        }
      });

      setRatings(initialRatings);
      console.log(initialRatings);
    }
  }, [isOpen, submissions, rubric, gradedSubmissionCache]);

  useEffect(() => {
    if (activeStudentId !== null) {
      const existingFeedback = getExistingIndividualFeedback(
        submissions,
        activeStudentId,
      );
      setExistingIndividualFeedback(existingFeedback || null);
    }
  }, [submissions, activeStudentId]);

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

  const handleSaveGrades = () => {
    const gradedSubmissions: PaletteGradedSubmission[] = submissions.map(
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
          const selectedPoints = ratings[`${criterion.id}-${submission.id}`];
          const selectedRating = criterion.ratings.find(
            (rating) => rating.points === selectedPoints,
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
      },
    );

    console.log("gradedSubmissions before concat", gradedSubmissions);

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

    console.log("gradedSubmissions after concat", gradedSubmissions);

    /**
     * Store graded submissions in cache
     */
    setGradedSubmissionCache((prev) => {
      console.log("prev", prev);
      return prev.concat(gradedSubmissions);
    });

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

  const getExistingGroupFeedback = (submissions: Submission[]) => {
    const allSubmissionComments = [];
    const seenComments = new Set<string>();
    const existingGroupComments = [];

    for (const submission of submissions) {
      const submissionComments = submission.comments;
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
    // console.log("Existing group comments:", existingGroupComments);
    return existingGroupComments;
  };

  const getExistingIndividualFeedback = (
    submissions: Submission[],
    submissionId: number,
  ) => {
    const existingGroupFeedback = getExistingGroupFeedback(submissions);
    const studentsComments = submissions.find(
      (submission) => submission.id === submissionId,
    )?.comments;

    const existingIndividualComments = studentsComments?.filter(
      (comment) =>
        !existingGroupFeedback.some(
          (existingComment) => existingComment.comment === comment.comment,
        ),
    );
    return existingIndividualComments;
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
                onClick={() => {
                  setShowGroupFeedbackTextArea(!showGroupFeedbackTextArea);
                  setShowExistingGroupFeedback(false);
                }}
                title="Add Group Feedback"
                focused={showGroupFeedbackTextArea}
              />
              <PaletteEye
                onClick={() => {
                  setShowExistingGroupFeedback(!showExistingGroupFeedback);
                  setShowGroupFeedbackTextArea(false);
                }}
                focused={showExistingGroupFeedback}
              />
            </div>
          </div>
          {showExistingGroupFeedback && renderExistingGroupFeedback()}
          {showGroupFeedbackTextArea && renderGroupFeedbackTextArea()}
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

  const renderGroupFeedbackTextArea = () => {
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

  const renderExistingGroupFeedback = () => {
    return (
      <div className="flex flex-col gap-2">
        {getExistingGroupFeedback(submissions).length > 0 ? (
          <>
            <h2 className="text-lg font-bold">Existing Group Comments</h2>
            <ul className="list-disc list-inside">
              {getExistingGroupFeedback(submissions).map((comment) => (
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

  const renderIndividualFeedbackTextArea = (submissionId: number) => {
    return (
      <div className="w-full">
        <textarea
          className="w-full min-h-12 max-h-32 text-black font-bold rounded px-2 py-1 bg-gray-300 overflow-auto
          scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
          onChange={(e) => {
            setIndividualFeedbacks((prev) => ({
              ...prev,
              [submissionId]: e.target.value,
            }));
          }}
          value={individualFeedbacks[submissionId]}
          placeholder={"Enter feedback for the individual..."}
        />
      </div>
    );
  };

  const renderExistingIndividualFeedback = (submissionId: number) => {
    if (activeStudentId !== submissionId) return null; // Only render if the student is active

    return (
      <div className="w-full">
        {existingIndividualFeedback ? (
          <>
            {existingIndividualFeedback.length > 0 ? (
              <>
                <h2 className="text-lg font-bold">Existing Comments</h2>
                <ul className="list-disc list-inside">
                  {existingIndividualFeedback.map((comment) => (
                    <li>{comment.comment}</li>
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

  const renderCriterionCommentTextArea = (criterionId: string) => {
    return (
      <div className="flex flex-col w-full gap-2 ">
        <textarea
          className="w-full min-h-12 max-h-32 text-black font-bold rounded px-2 py-1 bg-gray-300 overflow-auto
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

  const renderExistingCriterionComment = (criterionId: string) => {
    if (!showExistingCriterionComment) return null; // Only render if the section is active

    return (
      <div className="flex flex-col w-full gap-2">
        {existingCriterionComments[criterionId] ? (
          <>
            <h2 className="text-lg font-bold">Existing Criterion Comments</h2>
            <ul className="list-disc list-inside">
              <li key={criterionId}>
                {existingCriterionComments[criterionId]}
              </li>
            </ul>
          </>
        ) : (
          <p>No existing comments for this criterion</p>
        )}
      </div>
    );
  };

  const renderStudentHeaderControls = (submission: Submission) => {
    return (
      <div className="flex flex-col w-full items-center gap-2">
        <div className="flex items-center justify-center gap-4 text-center">
          <div className={"flex justify-between"}>
            <p>{`${submission.user.name} (${submission.user.asurite})`}</p>
            <p>{`Canvas Score ${calculateSubmissionTotal(submission)}`}</p>
          </div>
          <PaletteBrush
            onClick={() => {
              setActiveStudentId(
                activeStudentId === submission.id ? null : submission.id,
              );
              setShowIndividualFeedbackTextArea(true);
              setShowExistingIndividualFeedback(false);
            }}
            title="Add Feedback"
            focused={
              showIndividualFeedbackTextArea &&
              activeStudentId === submission.id
            }
          />
          <PaletteEye
            onClick={() => {
              setActiveStudentId((prev) =>
                prev === submission.id ? null : submission.id,
              );
              setShowExistingIndividualFeedback(true);
              setShowIndividualFeedbackTextArea(false);
            }}
            focused={
              showExistingIndividualFeedback &&
              activeStudentId === submission.id
            }
          />
        </div>
        {showExistingIndividualFeedback &&
          renderExistingIndividualFeedback(submission.id)}
        {activeStudentId === submission.id &&
          showIndividualFeedbackTextArea &&
          renderIndividualFeedbackTextArea(submission.id)}
      </div>
    );
  };

  const renderCriterionHeaderControls = (criterion: Criteria) => {
    return (
      <div>
        <div className="flex items-center gap-4 pr-4">
          <PaletteBrush
            onClick={() => {
              setActiveCriterion(
                activeCriterion === criterion.id ? null : criterion.id,
              );
              setShowCriterionCommentTextArea(true);
              setShowExistingCriterionComment(false);
            }}
            title="Add Criterion Comment"
            focused={
              showCriterionCommentTextArea && activeCriterion === criterion.id
            }
          />
          <PaletteEye
            onClick={() => {
              setActiveCriterion(
                activeCriterion === criterion.id ? null : criterion.id,
              );
              setShowExistingCriterionComment(true);
              setShowCriterionCommentTextArea(false);
            }}
            focused={
              showExistingCriterionComment && activeCriterion === criterion.id
            }
          />
        </div>
      </div>
    );
  };

  const renderGradingTable = () => {
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
                  {renderStudentHeaderControls(submission)}
                  {/*  todo add back the submission total*/}
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
                      activeCriterion === criterion.id &&
                      renderExistingCriterionComment(criterion.id)}
                    {showCriterionCommentTextArea &&
                      activeCriterion === criterion.id &&
                      renderCriterionCommentTextArea(criterion.id)}
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
                    {renderCriterionHeaderControls(criterion)}
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
  };

  return (
    <div className={"max-h-48 overflow-y-auto"}>
      {renderGradingPopup()}
      <ChoiceDialog />
    </div>
  );
}
