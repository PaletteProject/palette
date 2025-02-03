/**
 * Represents a rating option within a rubric criterion.
 */

export interface Rating {
  id: string;
  description: string;
  longDescription: string;
  points: number;
  key: string;
}
