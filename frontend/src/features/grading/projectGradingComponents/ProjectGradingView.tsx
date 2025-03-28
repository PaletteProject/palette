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
import { useEffect, useState } from "react";
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
import { useGradingContext } from "../../../context/GradingContext.tsx";

type ProjectGradingViewProps = {
  groupName: string;
  submissions: Submission[];
  savedGrades: Record<number, PaletteGradedSubmission>;
  rubric: Rubric;
  isOpen: boolean;
  onClose: (cache: Record<number, PaletteGradedSubmission>) => void; // event handler defined in GroupSubmissions.tsx
};

export function ProjectGradingView({
  groupName,
  submissions,
  rubric,
  isOpen,
  onClose,
  savedGrades,
}: ProjectGradingViewProps) {
  if (!isOpen) {
    return null;
  }

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

  const { setGradedSubmissionCache, gradedSubmissionCache } =
    useGradingContext();

  /**
   * Initialize project grading view.
   */
  useEffect(() => {
    if (isOpen) {
      const initialCache: Record<number, PaletteGradedSubmission> = {};

      submissions.forEach((submission) => {
        const saved = savedGrades[submission.id];
        const rubric_assessment: PaletteGradedSubmission["rubric_assessment"] =
          {};

        rubric.criteria.forEach((criterion) => {
          const savedCriterion = saved?.rubric_assessment?.[criterion.id];
          const canvasData = submission.rubricAssessment?.[criterion.id];

          rubric_assessment[criterion.id] = {
            points: savedCriterion?.points ?? canvasData?.points ?? "",

            rating_id: savedCriterion?.rating_id ?? canvasData?.rating_id ?? "",

            comments: savedCriterion?.comments ?? "", // You could pull from Canvas too if needed
          };
        });

        initialCache[submission.id] = {
          submission_id: submission.id,
          user: submission.user,
          individual_comment: saved?.individual_comment ?? undefined,
          group_comment: saved?.group_comment ?? undefined,
          rubric_assessment,
        };
      });

      setGradedSubmissionCache(initialCache);
    }
  }, [isOpen, submissions, rubric]);

  useEffect(() => {
    if (activeStudentId !== null) {
      const existingFeedback = getExistingIndividualFeedback(
        submissions,
        activeStudentId,
      );
      setExistingIndividualFeedback(existingFeedback || null);
    }
  }, [submissions, activeStudentId]);

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
      title: "Grading Progress Saved",
      message:
        'Current changes are saved in local memory. Click "Submit Grades to Canvas" when ready to push grades.',
      buttons: [
        {
          label: "Sweet!",
          action: () => {
            onClose(gradedSubmissionCache);
            console.log(gradedSubmissionCache);
            closeDialog();
          },
          autoFocus: true,
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
          {showGroupFeedbackTextArea && <GroupFeedback />}
          <GradingTable
            submissions={submissions}
            rubric={rubric}
            checkedCriteria={checkedCriteria}
            setCheckedCriteria={setCheckedCriteria}
            activeStudentId={activeStudentId}
            setActiveStudentId={setActiveStudentId}
            existingIndividualFeedback={existingIndividualFeedback}
          />

          <div className={"flex gap-4 justify-end"}>
            <PaletteActionButton
              title={"Close"}
              onClick={() => handleClickCloseButton()}
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
