/**
 * Primary project grading view. Opens as a modal over the grading dashboard.
 */

import { Submission, SubmissionComment } from "palette-types";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import {
  ChoiceDialog,
  PaletteActionButton,
  PaletteBrush,
  PaletteEye,
} from "@/components";
import { useChoiceDialog, useGradingContext, useRubric } from "@/context";
import { GroupFeedback } from "./GroupFeedback.tsx";
import { ExistingGroupFeedback } from "./ExistingGroupFeedback.tsx";
import { GradingTable } from "./GradingTable.tsx";

type ProjectGradingViewProps = {
  groupName: string;
  initMode: "restore" | "canvas" | "none";
  submissions: Submission[];
  isOpen: boolean;
  onClose: () => void; // event handler defined in GroupSubmissions.tsx
};

export function ProjectGradingView({
  groupName,
  submissions,
  isOpen,
  onClose,
  initMode,
}: ProjectGradingViewProps) {
  const { closeDialog } = useChoiceDialog();
  const { activeRubric } = useRubric();

  const { initializeGradingCache } = useGradingContext();

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

  // initialize project grading view based on cache state set above
  useEffect(() => {
    if (initMode) {
      initializeGradingCache(submissions, activeRubric, initMode);
    }
  }, [submissions, activeRubric.criteria]);

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
    onClose();
    closeDialog();
  };

  const renderGradingPopup = () => {
    const portalRoot = document.getElementById("portal-root");
    if (!portalRoot) return null;

    return createPortal(
      <div
        className={
          "scroll-auto fixed z-10 inset-0 bg-black bg-opacity-85 flex justify-center items-center text-white"
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
