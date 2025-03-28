import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import type { PaletteGradedSubmission } from "palette-types";

type GradingContextType = {
  gradedSubmissionCache: Record<number, PaletteGradedSubmission>;
  setGradedSubmissionCache: Dispatch<
    SetStateAction<Record<number, PaletteGradedSubmission>>
  >;
  updateScore: (
    submissionId: number,
    criterionId: string,
    points: number,
  ) => void;
  updateComment: (submissionId: number, text: string) => void;
  updateGroupComment: (text: string) => void;
};

const GradingContext = createContext<GradingContextType | undefined>(undefined);

export const useGradingContext = () => {
  const context = useContext(GradingContext);
  if (!context) {
    throw new Error("useGradingContext must be used within a GradingProvider");
  }
  return context;
};

export const GradingProvider = ({ children }: { children: ReactNode }) => {
  const [gradedSubmissionCache, setGradedSubmissionCache] = useState<
    Record<number, PaletteGradedSubmission>
  >({});

  // update a criterion rating for a target submission
  const updateScore = (
    submissionId: number,
    criterionId: string,
    points: number,
  ) => {
    setGradedSubmissionCache((prevCache) => {
      const prevSubmission = prevCache[submissionId];
      if (!prevSubmission) return prevCache; // nothing to update

      return {
        ...prevCache,
        [submissionId]: {
          ...prevSubmission,
          rubric_assessment: {
            ...prevSubmission.rubric_assessment,
            [criterionId]: {
              ...prevSubmission.rubric_assessment[criterionId],
              points,
            },
          },
        },
      };
    });
  };

  // update an individual submission comment
  const updateComment = (submissionId: number, text: string) => {
    setGradedSubmissionCache((prevCache) => {
      const prevSubmission = prevCache[submissionId];
      if (!prevSubmission) return prevCache; // nothing to change

      return {
        ...prevCache,
        [submissionId]: {
          ...prevSubmission,
          individual_comment: text
            ? {
                text_comment: text,
                group_comment: false,
              }
            : undefined,
        },
      };
    });
  };

  // Sets the group comment field of the first element in the grading cache. Canvas will automatically apply it to
  // all other group members.
  const updateGroupComment = (text: string) => {
    setGradedSubmissionCache((prev) => {
      const firstKey = Object.keys(prev)[0];
      if (!firstKey) return prev;

      const submission = prev[Number(firstKey)];

      return {
        ...prev,
        [firstKey]: {
          ...submission,
          group_comment: {
            text_comment: text,
            group_comment: true,
            sent: false, // reset `sent` flag when editing
          },
        },
      };
    });
  };

  return (
    <GradingContext.Provider
      value={{
        gradedSubmissionCache,
        setGradedSubmissionCache,
        updateScore,
        updateComment,
        updateGroupComment,
      }}
    >
      {children}
    </GradingContext.Provider>
  );
};
