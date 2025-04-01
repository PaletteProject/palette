/**
 * Submission data from Palette.
 */

export type PaletteGradedSubmission = {
  submission_id: number;
  user: { id: number; name: string; asurite: string };
  rubric_assessment: {
    [p: string]: { points: number; rating_id: string; comments: string };
  };

  individual_comment?: { text_comment: string; group_comment: false };
  group_comment?: { text_comment: string; group_comment: true; sent: boolean };
};
