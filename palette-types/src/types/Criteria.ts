/**
 * Represents a criterion within a grading rubric or as a collection of template criteria.
 */

import { Rating } from "./Rating";

export interface Criteria {
  id: string;
  description: string;
  longDescription: string;
  pointsGraded?: number;
  ratings: Rating[];
  pointsPossible: number;
  scores: number[];
  template?: string; // placeholder
  templateTitle?: string;
  key: string;
  updatePoints: () => void;
  isGroupCriterion: boolean;
}
