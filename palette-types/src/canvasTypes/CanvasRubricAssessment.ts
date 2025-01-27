/**
 * Required information to create a new rubric assessment on Canvas. Used as part of a CanvasAddRubricAssessmentRequest
 */

export interface CanvasRubricAssessment {
  user_id: number; // unique id (from Canvas) of the user being graded

  // Canvas supports 3 types, however only grading is currently used in Palette
  assessment_type: "grading" | "peer_review" | "provisional_grade";

  // mapped grading information
  data: {
    criterion_id: string; // unique string id for graded criterion
    points: number; // assigned score for given criterion
    comments?: string;
  }[];
}
