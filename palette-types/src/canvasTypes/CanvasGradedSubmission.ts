export interface CanvasGradedSubmission {
  submission_id: number;
  user: {
    id: number;
    name: string;
    asurite: string;
  };
  rubric_assessment: {
    [p: string]: {
      points: number;
      rating_id: string;
      comments: string;
    };
  };
  comment: {
    text_comment: string | undefined;
    group_comment: boolean;
  };
}
