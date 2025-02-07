/**
 * Defines the Submission type for use within the Palette application.
 *
 */
export interface Submission {
  id: number;
  user: {
    id: number;
    name: string;
    asurite: string; // stored as user.login_id in Canvas Submission response
  };
  group: {
    id: number;
    name: string;
  };
  comments: {
    id: number;
    authorName: string;
    comment: string;
  }[];
  rubricAssessment: {
    [criterion_id: string]: {
      rating_id: string;
      comments: string;
      points: number;
    };
  };
  graded: boolean;
  gradedBy: number; // grader ID
  workflowState: "submitted" | "unsubmitted" | "graded" | "pending_review"; // submission status provided by Canvas
  late?: boolean;
  missing?: boolean;
  attachments?: {
    filename: string;
    url: string;
  }[];
}
