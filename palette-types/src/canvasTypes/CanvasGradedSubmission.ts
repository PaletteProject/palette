/**
 * What Canvas needs to properly update a submission.
 */

export type CanvasGradedSubmission = {
  submission_id: number;
  user: { id: number; name: string; asurite: string };
  rubric_assessment: {
    [p: string]: { points: number; rating_id: string; comments: string };
  };
  comment?: {
    text_comment: string;
    group_comment: boolean;
  };
};
