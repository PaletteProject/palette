
import { CanvasGradedSubmission } from 'palette-types';

export async function submitGradesToCanvas(
  courseId: string,
  assignmentId: string,
  grades: Record<number, CanvasGradedSubmission>,
  accessToken: string
): Promise<void> {
  const submissionPromises = Object.entries(grades).map(
    async ([userId, submission]) => {
      const url = `https://canvas.instructure.com/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}`;
      const body = {
        submission: {
          posted_grade: submission.score.toString(),
        },
        comment: {
          text_comment: submission.comment || '',
        },
      };

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
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
