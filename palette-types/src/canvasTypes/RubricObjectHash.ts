import { CanvasAssociation } from "./CanvasAssociation";
import { CanvasRubric } from "./CanvasRubric";

/**
 * This type represents the return value of the Canvas API when creating, updating a rubric.
 * From experimentation with the API, if this is the return type, the following is true:
 * - The rubric field will always be present in the response
 * - If the rubric was updated but the association wasn't updated, the rubric_association field will be missing in the response
 * - If the rubric was updated and the association field was updated, the rubric_association field will be present in the response
 */
export interface RubricObjectHash {
  rubric: CanvasRubric;
  rubric_association?: CanvasAssociation;
}
