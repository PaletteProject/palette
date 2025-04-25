import { PaletteGradedSubmission, CanvasGradedSubmission} from "palette-types";

function calculateScore(submission: CanvasGradedSubmission): number {
  if (!submission.rubric_assessment) return 0;

  return Object.values(submission.rubric_assessment)
    .map((entry) => Number(entry.points) || 0)
    .reduce((a, b) => a + b, 0);
}

interface CanvasSubmissionPayload {
  submission: {
    posted_grade: string;
  };
  comment?: {
    text_comment: string;
  };
}

export async function submitGradesToCanvas(
  courseId: string,
  assignmentId: string,
  grades: Record<number, PaletteGradedSubmission>,
  accessToken: string
): Promise<void> {
  const submissionPromises = Object.entries(grades).map(
    async ([userId, submission]) => {
      const url = `https://canvas.instructure.com/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}`;

      const payload: CanvasSubmissionPayload = {
        submission: {
          posted_grade: calculateScore(submission).toString(),
        },
      };

      if (submission.individual_comment && typeof submission.individual_comment === "string") {
        payload.comment = {
          text_comment: submission.individual_comment,
        };
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to submit grade for user ${userId}: ${errorText}`
        );
      }
    }
  );

  await Promise.all(submissionPromises);
}
