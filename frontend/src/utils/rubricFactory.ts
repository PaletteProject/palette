/**
 * Collection of factory functions for the Rubric Builder feature when generating rubric elements from the Palette
 * application.
 */

import { Criteria, Rating, Rubric } from "palette-types";
import { v4 as uuid } from "uuid";
import { calcMaxPoints } from "./calculateMaxPoints.ts";

const DEFAULT_CRITERIA_COUNT = 1;

/**
 * Helper function to populate default criteria.
 */
function populateDefaultCriteria() {
  const criteria: Criteria[] = [];
  for (let i = 0; i < DEFAULT_CRITERIA_COUNT; i++) {
    criteria.push(createCriterion());
  }
  return criteria;
}

/**
 * Helper function to populate default ratings.
 *
 * Each criterion must have a minimum of two rating options that cannot be deleted - full marks and no marks.
 */
function populateDefaultRatings() {
  const ratings: Rating[] = [];
  ratings.push(createRating(5, "Well done", ""));
  ratings.push(createRating(0, "Not included", ""));
  return ratings;
}

/**
 * Rubric factory function. Assigns a unique key with uuid.
 */
export function createRubric(
  title: string = "",
  criteria: Criteria[] = populateDefaultCriteria(),
  id?: number,
  pointsPossible: number = 0,
): Rubric {
  return {
    title,
    pointsPossible,
    criteria,
    id,
    key: uuid(),
  };
}

/**
 * Criterion factory function.
 * Sets default values for dynamically added elements but allows to pass in existing values for imports coming from
 * the backend.
 *
 * Generates a unique key for React with a universally unique identifier (UUID).
 *
 * id is only assigned if criterion is being imported from Canvas.
 */
export function createCriterion(
  description: string = "",
  longDescription: string = "",
  points: number = 0,
  ratings: Rating[] = populateDefaultRatings(),
  id?: number,
  template: string = "",
  templateTitle: string = "",
): Criteria {
  return {
    ratings,
    description,
    longDescription,
    points,
    id,
    template,
    templateTitle,
    key: uuid(),
    updatePoints() {
      this.points = Number(calcMaxPoints(this.ratings));
    },
  };
}

/**
 * Rating factory function. Generates unique key for React with uuid.
 *
 */
export function createRating(
  points: number = 0,
  description: string = "",
  longDescription: string = "",
  id?: number,
): Rating {
  return {
    points,
    description,
    longDescription,
    id,
    key: uuid(),
  };
}
