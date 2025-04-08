/**
 * Primary project grading view. Opens as a modal over the grading dashboard.
 */

import {
  PaletteGradedSubmission,
  Submission,
  SubmissionComment,
} from "palette-types";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import {
  ChoiceDialog,
  PaletteActionButton,
  PaletteBrush,
  PaletteEye,
} from "@/components";
import {
  SavedGrades,
  useChoiceDialog,
  useGradingContext,
  useRubric,
} from "@/context";
import { GroupFeedback } from "./GroupFeedback.tsx";
import { ExistingGroupFeedback } from "./ExistingGroupFeedback.tsx";
import { GradingTable } from "./GradingTable.tsx";

type ProjectGradingViewProps = {
  groupName: string;
  submissions: Submission[];
  isOpen: boolean;
  onClose: (cache: Record<number, PaletteGradedSubmission>) => void; // event handler defined in GroupSubmissions.tsx
};

export function ProjectGradingView({
  groupName,
  submissions,
  isOpen,
  onClose,
}: ProjectGradingViewProps) {
  const { closeDialog, openDialog } = useChoiceDialog();
  const { activeRubric } = useRubric();

  const { setGradedSubmissionCache, gradedSubmissionCache } =
    useGradingContext();

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

  const checkLocalCache = () => {
    const stored = localStorage.getItem("gradedSubmissionCache");
    const parsed = stored ? (JSON.parse(stored) as SavedGrades) : null;

    if (parsed && Object.keys(parsed).length > 0) {
      console.log("unsaved cache detected");
      return true;
    } else {
      return false;
    }
  };

  // track cache restoration to avoid double merge
  const hasRestoredCache = useRef(false);

  /**
   * Initialize project grading view.
   */
  useEffect(() => {
    if (!isOpen) return;

    if (checkLocalCache() && !hasRestoredCache.current) {
      openDialog({
        title: "Load Existing Ratings?",
        message:
          "Unsaved changes to grades were detected. Would you like to restore them or load in Canvas data?",
        excludeCancel: true,
        buttons: [
          {
            label: "Restore",
            action: () => {
              const stored = localStorage.getItem("gradedSubmissionCache");
              if (stored) {
                const restoredCache = JSON.parse(stored) as SavedGrades;
                setGradedSubmissionCache(restoredCache);
                hasRestoredCache.current = true;
              }
              closeDialog();
            },
            autoFocus: true,
            color: "GREEN",
          },
          {
            label: "Load Canvas Data",
            action: () => {
              console.log("loading canvas grades");
              closeDialog();
              hasRestoredCache.current = false;
            },
            autoFocus: false,
            color: "YELLOW",
          },
        ],
      });
    }

    const initialCache: Record<number, PaletteGradedSubmission> = {};

    submissions.forEach((submission) => {
      const saved = gradedSubmissionCache[submission.id];
      const rubric_assessment: PaletteGradedSubmission["rubric_assessment"] =
        {};

      activeRubric.criteria.forEach((criterion) => {
        const savedCriterion = saved?.rubric_assessment?.[criterion.id];
        const canvasData = submission.rubricAssessment?.[criterion.id];

        rubric_assessment[criterion.id] = {
          points: savedCriterion?.points ?? canvasData?.points ?? "",

          rating_id: savedCriterion?.rating_id ?? canvasData?.rating_id ?? "",

          comments: savedCriterion?.comments ?? "",
        };
      });

      initialCache[submission.id] = {
        submission_id: submission.id,
        user: submission.user,
        individual_comment: saved?.individual_comment ?? undefined,
        group_comment: saved?.group_comment ?? undefined,
        rubric_assessment,
      } as PaletteGradedSubmission;
    });

    // check that cache hasn't already been restored to avoid a double merge effort
    if (!hasRestoredCache.current) {
      setGradedSubmissionCache((prev) => {
        return {
          ...prev,
          ...initialCache,
        };
      });
    }
  }, [isOpen, submissions, activeRubric.criteria]);

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
    onClose(gradedSubmissionCache);
    closeDialog();
  };

  const renderGradingPopup = () => {
    const portalRoot = document.getElementById("portal-root");
    if (!portalRoot) return null;

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
      portalRoot,
    );
  };

  return (
    <div className={"max-h-48 overflow-y-auto"}>
      {renderGradingPopup()}
      <ChoiceDialog />
    </div>
  );
}
