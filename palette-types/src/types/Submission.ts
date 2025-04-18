import { SubmissionComment } from "./SubmissionComment";
import { RubricAssessment } from "./RubricAssessment";

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
  comments: SubmissionComment[];
  rubricAssessment: RubricAssessment;
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
