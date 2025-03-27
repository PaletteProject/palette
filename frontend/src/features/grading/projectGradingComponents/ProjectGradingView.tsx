/**
 * Primary project grading view. Opens as a modal over the grading dashboard.
 */

import {
  PaletteGradedSubmission,
  Rubric,
  Submission,
  SubmissionComment,
} from "palette-types";
import { createPortal } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  ChoiceDialog,
  PaletteActionButton,
  PaletteBrush,
  PaletteEye,
} from "@components";
import { useChoiceDialog } from "../../../context/DialogContext.tsx";
import { GroupFeedback } from "./GroupFeedback.tsx";
import { ExistingGroupFeedback } from "./ExistingGroupFeedback.tsx";
import { GradingTable } from "./GradingTable.tsx";

type ProjectGradingViewProps = {
  groupName: string;
  submissions: Submission[];
  rubric: Rubric;
  isOpen: boolean;
  onClose: () => void; // event handler defined in GroupSubmissions.tsx
  setGradedSubmissionCache: Dispatch<
    SetStateAction<Record<number, PaletteGradedSubmission>>
  >;
  gradedSubmissionCache: Record<number, PaletteGradedSubmission>;
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

  const [feedback, setFeedback] = useState<Record<number, string>>({});

  // Existing feedback states
  const [existingIndividualFeedback, setExistingIndividualFeedback] = useState<
    SubmissionComment[] | null
  >(null);

  // UI state
  const [showExistingGroupFeedback, setShowExistingGroupFeedback] =
    useState<boolean>(false);

  // Active student and criterion states
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);

  // Text area states

  const [showGroupFeedbackTextArea, setShowGroupFeedbackTextArea] =
    useState<boolean>(false);

  // group grading checkbox state
  const [checkedCriteria, setCheckedCriteria] = useState<{
    [key: string]: boolean;
  }>({});

  const { openDialog, closeDialog } = useChoiceDialog();

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
        if (feedback[submission.id]) {
          individualComment = {
            text_comment: feedback[submission.id],
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
    setGradedSubmissionCache((prev) => {
      return prev.concat(gradedSubmissions);
    });

    onClose();
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

    return studentsComments?.filter(
      (comment) =>
        !existingGroupFeedback.some(
          (existingComment) => existingComment.comment === comment.comment,
        ),
    );
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
          {showExistingGroupFeedback && (
            <ExistingGroupFeedback
              submissions={submissions}
              getExistingGroupFeedback={getExistingGroupFeedback}
            />
          )}
          {showGroupFeedbackTextArea && (
            <GroupFeedback
              groupFeedback={groupFeedback}
              setGroupFeedback={setGroupFeedback}
            />
          )}
          <GradingTable
            submissions={submissions}
            rubric={rubric}
            ratings={ratings}
            setRatings={setRatings}
            checkedCriteria={checkedCriteria}
            setCheckedCriteria={setCheckedCriteria}
            activeStudentId={activeStudentId}
            setActiveStudentId={setActiveStudentId}
            feedback={feedback}
            setFeedback={setFeedback}
            existingIndividualFeedback={existingIndividualFeedback}
            criterionComments={criterionComments}
            setCriterionComments={setCriterionComments}
            gradedSubmissionCache={gradedSubmissionCache}
          />

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

  return (
    <div className={"max-h-48 overflow-y-auto"}>
      {renderGradingPopup()}
      <ChoiceDialog />
    </div>
  );
}
