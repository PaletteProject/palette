import { RubricCriterion } from "./RubricCriterion.ts"; // frontend extension defined locally
import { v4 as uuidv4 } from "uuid";
import { Rubric as BaseRubric } from "../../../palette-types/src";
import { UNASSIGNED } from "../../../palette-types/src/constants.ts";

/**
 * Extend global rubric type but ensure key is a required field for the frontend.
 */
export interface Rubric extends BaseRubric {
  key: string;
  rubricCriteria: RubricCriterion[];
}

/**
 * Rubric factory function. Assigns a unique key with uuid.
 */
export default function createRubric(
  title: string = "",
  rubricCriteria: RubricCriterion[] = [],
  pointsPossible: number = 0,
  id: number = UNASSIGNED,
): Rubric {
  return {
    title,
    pointsPossible,
    rubricCriteria,
    id,
    key: uuidv4(),
  };
}
