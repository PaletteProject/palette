import {
  GroupedSubmissions,
  PaletteGradedSubmission,
  Rubric,
  Submission,
} from "palette-types";
import { AssignmentData, GroupSubmissions } from "@/features";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Dialog, PaletteActionButton } from "@/components";
import {
  useAssignment,
  useChoiceDialog,
  useCourse,
  useGradingContext,
  useRubric,
} from "@/context";
import { cn } from "@/lib/utils.ts";
import { RubricForm } from "@/features/rubricBuilder/RubricForm.tsx";
import { useRubricBuilder } from "@/hooks";
import { calcMaxPoints } from "@/utils";

type SubmissionDashboardProps = {
  submissions: GroupedSubmissions;
  fetchSubmissions: () => Promise<void>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  builderOpen: boolean;
  setBuilderOpen: Dispatch<SetStateAction<boolean>>;
};

export function SubmissionsDashboard({
  submissions,
  fetchSubmissions,
  setLoading,
  builderOpen,
  setBuilderOpen,
}: SubmissionDashboardProps) {
  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();
  const { activeRubric, setActiveRubric } = useRubric();
  const { openDialog, closeDialog } = useChoiceDialog();
  const { putRubric } = useRubricBuilder();
  const { gradedSubmissionCache, setGradedSubmissionCache } =
    useGradingContext();

  const BASE_URL = "http://localhost:3000/api";
  const GRADING_ENDPOINT = `/courses/${activeCourse?.id}/assignments/${activeAssignment?.id}/submissions/`;

  const [tempGrades, setTempGrades] = useState<
    Record<number, PaletteGradedSubmission>
  >({});
  const [oldRubric, setOldRubric] = useState<Rubric>(activeRubric);

  // opens the rubric builder in hot swap mode
  const modifyRubric = () => {
    setTempGrades(gradedSubmissionCache); // store the current grades
    setOldRubric(activeRubric); // store prev rubric
    setBuilderOpen(true);
  };

  // gets called from the modal rubric builder in hot swap mode

  // todo: write up technical challenge
  const getUpdatedRubric = async () => {
    try {
      const response = await putRubric();
      if (response.success) {
        const newRubric = response.data as Rubric;
        // ensure new criteria have unique key for react and all required fields
        const updatedRubric = {
          ...newRubric,
          criteria: newRubric.criteria.map((c) => ({
            ...c,
            pointsPossible: calcMaxPoints(c.ratings),
            isGroupCriterion: c.isGroupCriterion ?? true,
            key: c.key || crypto.randomUUID(),
            ratings: c.ratings.map((r) => {
              return {
                ...r,
                key: r.key || crypto.randomUUID(),
              };
            }),
          })),
        };

        setActiveRubric(updatedRubric);
        mapExistingGrades(updatedRubric);
        setBuilderOpen(false);
      }
    } catch (error) {
      console.error("Error updating the rubric", error);
    }
  };

  const mapExistingGrades = (newRubric: Rubric) => {
    if (!oldRubric) return;

    console.log("got new rubric", newRubric);
    const updatedGrades: Record<number, PaletteGradedSubmission> = {};

    Object.entries(tempGrades).forEach(([id, submission]) => {
      const oldAssessment = submission.rubric_assessment || {};
      const newAssessment: PaletteGradedSubmission["rubric_assessment"] = {};

      newRubric.criteria.forEach((newCriterion) => {
        // match by description
        const matchingOldCriterion = oldRubric.criteria.find(
          (old) => old.description === newCriterion.description,
        );

        if (matchingOldCriterion) {
          const oldCriterionId = matchingOldCriterion.id;
          const oldGrade = oldAssessment[oldCriterionId];

          console.log("old grade:", oldGrade);
          if (oldGrade) {
            newAssessment[newCriterion.id] = {
              points: oldGrade.points,
              rating_id: oldGrade.rating_id,
              comments: oldGrade.comments,
            };
          }
        }
      });

      updatedGrades[Number(id)] = {
        ...submission,
        rubric_assessment: newAssessment,
      };
    });

    setGradedSubmissionCache(updatedGrades);
  };

  /**
   * Submit all graded submissions in the cache
   */
  const submitGrades = async () => {
    setLoading(true);

    for (const gradedSubmission of Object.values(gradedSubmissionCache)) {
      if (gradedSubmission.user?.id) {
        await fetch(
          `${BASE_URL}${GRADING_ENDPOINT}${gradedSubmission.user.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(gradedSubmission),
          },
        );
      }
    }
    setLoading(false);

    await fetchSubmissions(); // refresh submissions
    setLoading(false);
    setGradedSubmissionCache({}); // clear submission cache
    localStorage.removeItem("gradedSubmissionCache"); // clear local storage
  };

  const handleClickSubmitGrades = () => {
    openDialog({
      title: "Submit Grades to Canvas?",
      message: "Clicking yes will post grades to Canvas.",
      excludeCancel: true,
      buttons: [
        {
          label: "Send them!",
          action: () => {
            void submitGrades();
            closeDialog();
          },
          autoFocus: true,
        },
        {
          label: "Cancel",
          action: () => closeDialog(),
          autoFocus: false,
          color: "RED",
        },
      ],
    });
  };

  const isGraded = (submission: Submission) => {
    if (!submission) return false; // skip empty entries

    const rubric = submission.rubricAssessment; // fallback to canvas data

    if (!rubric) return false;

    return Object.values(rubric).every(
      (entry) => entry && entry.points >= 0 && !Number.isNaN(entry.points),
    );
  };

  return (
    <div className={"grid justify-start"}>
      <div className={"grid gap-2 mb-4 p-4"}>
        <h1 className={"text-5xl font-bold"}>Submission Dashboard</h1>
        <AssignmentData modifyRubric={() => void modifyRubric()} />
        <div className={"flex"}>
          <PaletteActionButton
            color={"GREEN"}
            title={"Submit Grades to Canvas"}
            onClick={() => handleClickSubmitGrades()}
          />
        </div>
      </div>

      <div
        className={cn(
          "grid gap-4 px-8 max-w-screen-lg",
          "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
        )}
      >
        {Object.entries(submissions).map(([groupName, groupSubmissions]) => {
          const progress = useMemo(() => {
            if (!groupSubmissions || groupSubmissions.length === 0) return 0;
            const gradedCount = groupSubmissions.filter(isGraded).length;
            return Math.floor((gradedCount / groupSubmissions.length) * 100);
          }, [groupSubmissions, gradedSubmissionCache]);
          return (
            <GroupSubmissions
              key={groupName}
              groupName={groupName}
              progress={progress}
              submissions={groupSubmissions}
              fetchSubmissions={fetchSubmissions}
            />
          );
        })}
      </div>

      <Dialog
        isOpen={builderOpen}
        onClose={() => setBuilderOpen(false)}
        title={"Hot Swap Criteria"}
      >
        <div className={"container relative"}>
          <RubricForm
            hotSwapActive={true}
            getUpdatedRubric={getUpdatedRubric}
          />
        </div>
      </Dialog>
    </div>
  );
}
