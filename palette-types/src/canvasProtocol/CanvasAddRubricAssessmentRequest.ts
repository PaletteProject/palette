/**
 * Defines the required parameters for creating a single rubric assessment for a target submission on Canvas.
 */
import { CanvasRubricAssessment } from "../canvasTypes/CanvasRubricAssessment";

export interface CanvasAddRubricAssessmentRequest {
  course_id: number; // unique id (from Canvas) for active course user is grading within
  rubric_association_id: number; // links the rubric and assignment together (from Canvas)
  rubric_assessment: CanvasRubricAssessment; //
}
