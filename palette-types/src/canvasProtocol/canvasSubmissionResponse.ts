export interface CanvasSubmissionResponse {
  id: number;
  score: number;
  submitted_at: string;
  assignment_id: number;
  workflow_state: string;
  graded_at: string;
  grader_id: number;
  late: boolean;
  missing: boolean;
  group: {
    id: number;
    name: string;
  };
  attachments: {
    filename: string;
    url: string;
  }[];
  user: {
    id: number;
    name: string;
    login_id: string;
  };
  submission_comments: {
    id: number;
    author_name: string;
    comment: string;
  }[];
  rubric_assessment: {
    [criterion_id: string]: {
      rating_id: string;
      comments: string;
      points: number;
    };
  };
}
