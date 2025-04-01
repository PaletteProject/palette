// A CanvasRubric object represents a grading rubric
import { CanvasAssociation } from "./CanvasAssociation";
import { CanvasAssessment } from "./CanvasAssessment";
import { CanvasCriterion } from "./CanvasCriterion";

export interface CanvasRubric {
  // the ID of the rubric
  id?: number;

  // the title of the rubric
  title: string; // REQUIRED

  // the context owning the rubric
  context_id?: number;

  context_type?: ContextType;

  // possible points for the rubric
  points_possible: number; // REQUIRED

  reusable?: boolean;

  read_only?: boolean;

  // whether free-form comments are used
  free_form_criterion_comments?: boolean;

  hide_score_total?: boolean;

  /**
   * An array with all of this CanvasRubric's grading Criteria.
   *
   * Note: The canvasAPI documentation
   * is inconsistent about the actual name of this field - it is sometimes called
   * 'criteria' and others 'data'.
   */
  data: CanvasCriterion[] | null;

  /**
   * (Optional) If an assessment type is included in the 'include' parameter, includes an
   * array of rubric assessment objects for a given rubric, based on the
   * assessment type requested. If the user does not request an assessment type,
   * this key will be absent.
   */
  assessments?: CanvasAssessment[] | null;

  /**
   * (Optional) If an association type is included in the 'include' parameter, includes an
   * array of rubric association objects for a given rubric, based on the
   * association type requested. If the user does not request an association type,
   * this key will be absent.
   */
  associations?: CanvasAssociation[] | null;
  // the rubrics react key
}

// Type of context owning the rubric. (Note: Documentation only shows "Course" as an example. Other values may be possible - consider monitoring actual usage.)
export type ContextType = "Course";
