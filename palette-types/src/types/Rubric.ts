/**
 * Represents a grading rubric within the Palette application. Omits fields that are specific to the Canvas API.
 */

import { Criteria } from "./Criteria";

export interface Rubric {
  id: number;
  title: string;
  pointsPossible: number;
  key: string; // unique id for react
  criteria: Criteria[];
}
