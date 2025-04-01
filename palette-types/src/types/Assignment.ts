/**
 * Defines an Assignment object within the Palette context.
 */

export interface Assignment {
  id: number;
  name: string;
  description: string;
  dueDate: string;
  pointsPossible: number;
  rubricId: number | undefined; // associated rubric
  createdAt: string;
}
