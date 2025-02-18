// Utility functions for rubric conversion and miscellaneous operations
import {
  CanvasCriterion,
  CanvasRating,
  CanvasRubric,
  RequestFormattedCriteria,
  RequestFormattedRubric,
  Rubric,
  RubricAssociation,
} from "palette-types";

import { v4 as uuid } from "uuid"; /**
 * Transforms the rubric object into the format expected by the Canvas API.
 *
 */

/**
 * Transforms the rubric object into the format expected by the Canvas API.
 *
 */
/**
 * Transforms the rubric object into the format expected by the Canvas API.
 *
 * @param {Rubric} originalRubric - The original rubric object.
 * @returns {RequestFormattedRubric} - The transformed rubric object.
 */
export const toCanvasFormat = (
  originalRubric: Rubric,
): RequestFormattedRubric => {
  const formattedCriteria: RequestFormattedCriteria = Object.fromEntries(
    originalRubric.criteria.map((criterion, index) => {
      return [
        index + 1,
        {
          description: criterion.description,
          long_description: criterion.longDescription,
          points: criterion.pointsPossible,
          ratings: Object.fromEntries(
            criterion.ratings.map((rating, ratingIndex) => {
              return [
                ratingIndex + 1,
                {
                  description: rating.description,
                  long_description: rating.longDescription,
                  points: rating.points,
                },
              ];
            }),
          ),
        },
      ];
    }),
  );
  // return the transformed rubric object
  return {
    title: originalRubric.title,
    criteria: formattedCriteria,
  };
};

export const toPaletteFormat = (rubric: CanvasRubric): Rubric => {
  return {
    id: rubric.id,
    title: rubric.title,
    pointsPossible: rubric.points_possible,
    key: uuid(),
    criteria:
      rubric.data?.map((criterion: CanvasCriterion) => ({
        id: criterion.id,
        description: criterion.description,
        longDescription: criterion.long_description,
        pointsPossible: criterion.points,
        key: uuid(),
        updatePoints: () => {
          throw new Error("Not implemented");
        },
        ratings: criterion.ratings?.map((rating: CanvasRating) => ({
          id: rating.id,
          description: rating.description,
          longDescription: rating.long_description,
          points: rating.points,
          key: uuid(),
        })),
        scores: [],
      })) || [],
  } as Rubric;
};

/**
 * Factory function to make a rubric association.
 * @param assignment_id
 */
export const createAssignmentAssociation = (
  assignment_id: number,
): RubricAssociation => {
  return {
    association_type: "Assignment",
    association_id: assignment_id,
    use_for_grading: true,
    purpose: "grading",
  };
};
