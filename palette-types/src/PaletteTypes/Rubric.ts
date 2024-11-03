/**
 * Represents a grading rubric within the Palette application. Omits fields that are specific to the Canvas API.
 */

import { Criteria } from "./Criteria";

export interface Rubric {
  id?: number; // id is optional as new rubrics will not have one assigned by Canvas yet
  title: string;
  pointsPossible: number;
  key: string; // required unique id for react
  criteria: Criteria[];
}