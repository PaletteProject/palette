import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import type {
  PaletteGradedSubmission,
  Rubric,
  Submission,
} from "palette-types";

type GradingContextType = {
  gradedSubmissionCache: SavedGrades;
  setGradedSubmissionCache: Dispatch<SetStateAction<SavedGrades>>;
  updateScore: (
    submissionId: number,
    criterionId: string,
    points: number,
  ) => void;
  updateComment: (submissionId: number, text: string) => void;
  updateGroupComment: (text: string) => void;
  initializeGradingCache: (
    submissions: Submission[],
    rubric: Rubric,
    mode: "restore" | "canvas",
  ) => void;
};

export type SavedGrades = Record<number, PaletteGradedSubmission>;

const GradingContext = createContext<GradingContextType | undefined>(undefined);

export const useGradingContext = () => {
  const context = useContext(GradingContext);
  if (!context) {
    throw new Error("useGradingContext must be used within a GradingProvider");
  }
  return context;
};

export const GradingProvider = ({ children }: { children: ReactNode }) => {
  // track all in progress grades
  const [gradedSubmissionCache, setGradedSubmissionCache] =
    useState<SavedGrades>(() => {
      const stored = localStorage.getItem("gradedSubmissionCache");
      return stored ? (JSON.parse(stored) as SavedGrades) : {};
    });

  // persist in-progress grades to local storage whenever they change
  useEffect(() => {
    localStorage.setItem(
      "gradedSubmissionCache",
      JSON.stringify(gradedSubmissionCache),
    );
  }, [gradedSubmissionCache]);

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

  const initializeGradingCache = (
    submissions: Submission[],
    rubric: Rubric,
    mode: "restore" | "canvas",
  ) => {
    const localCacheRaw = localStorage.getItem("gradedSubmissionCache");
    const localCache = localCacheRaw
      ? (JSON.parse(localCacheRaw) as SavedGrades)
      : {};

    const newCache: Record<number, PaletteGradedSubmission> = {};

    submissions.forEach((submission) => {
      const saved = mode === "restore" ? localCache[submission.id] : undefined;
      const canvas = submission.rubricAssessment;

      const rubric_assessment: PaletteGradedSubmission["rubric_assessment"] =
        {};

      rubric.criteria.forEach((criterion) => {
        const savedCriterion = saved?.rubric_assessment?.[criterion.id];
        const canvasData = canvas?.[criterion.id];

        rubric_assessment[criterion.id] = {
          points: savedCriterion?.points ?? canvasData?.points ?? "",
          rating_id: savedCriterion?.rating_id ?? canvasData?.rating_id ?? "",
          comments: savedCriterion?.comments ?? "",
        };
      });

      newCache[submission.id] = {
        submission_id: submission.id,
        user: submission.user,
        individual_comment: saved?.individual_comment ?? undefined,
        group_comment: saved?.group_comment ?? undefined,
        rubric_assessment,
      };
    });

    setGradedSubmissionCache((prev) => ({
      ...prev,
      ...newCache,
    }));
  };

  return (
    <GradingContext.Provider
      value={{
        gradedSubmissionCache,
        setGradedSubmissionCache,
        updateScore,
        updateComment,
        updateGroupComment,
        initializeGradingCache,
      }}
    >
      {children}
    </GradingContext.Provider>
  );
};
