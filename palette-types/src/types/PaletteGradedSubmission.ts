/**
 * What Canvas needs to properly update a submission.
 */

export type PaletteGradedSubmission = {
  submission_id: number;
  user: { id: number; name: string; asurite: string };
  rubric_assessment: {
    [p: string]: { points: number; rating_id: string; comments: string };
  };

  // Having both of these lets us send group and individual comments to canvas in the same session.
  // This is important because we want to ensure that the professor can send an individual comment to every member of the group,
  // and still send a group comment to the entire group.
  individual_comment?: { text_comment: string; group_comment: false };
  group_comment?: { text_comment: string; group_comment: true; sent: boolean };
  // Using the sent flag to prevent multiple submissions in SubmissionsDashboard.tsx submitGrades() forloop
};
