/**
 * Represents a criterion within a grading rubric or as a collection of template criteria.
 */

import { Rating } from "./Rating";

export interface Criteria {
  id?: number;
  description: string;
  longDescription: string;
  points: number;
  ratings: Rating[];
  template?: string; // placeholder
  templateTitle?: string;
  key: string;
  updatePoints: () => void;
}
