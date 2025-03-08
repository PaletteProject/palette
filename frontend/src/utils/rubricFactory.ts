/**
 * Collection of factory functions for the Rubric Builder feature when generating rubric elements from the Palette
 * application.
 */

import { Criteria, Rating, Rubric, Settings } from "palette-types";
import { v4 as uuid } from "uuid";
import { calcMaxPoints } from "./calculateMaxPoints.ts";

const DEFAULT_CRITERIA_COUNT = 1;

/**
 * Helper function to populate default ratings based on user settings.
 */
function populateDefaultRatings(settings: Settings): Rating[] {
  return [
    createRating(
      settings.preferences.defaultRatings.maxDefaultPoints,
      settings.preferences.defaultRatings.maxDefaultDescription,
    ),
    createRating(
      settings.preferences.defaultRatings.minDefaultPoints,
      settings.preferences.defaultRatings.minDefaultDescription,
    ),
  ];
}

/**
 * Helper function to populate default criteria.
 */
function populateDefaultCriteria(settings: Settings): Criteria[] {
  return Array.from({ length: DEFAULT_CRITERIA_COUNT }, () =>
    createCriterion(settings),
  );
}

/**
 * Rubric factory function.
 */
export function createRubric(
  settings: Settings,
  title: string = "",
  criteria: Criteria[] = populateDefaultCriteria(settings),
  id: string = "",
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
 */
export function createCriterion(
  settings: Settings,
  description: string = "",
  longDescription: string = "",
  ratings: Rating[] = populateDefaultRatings(settings),
  points: number = ratings.reduce((sum, rating) => sum + rating.points, 0),
  id: string = "",
  template: string = "",
  templateTitle: string = "",
  scores: number[] = [],
  isGroupCriterion: boolean = true,
): Criteria {
  return {
    id,
    description,
    longDescription,
    ratings,
    pointsPossible: points,
    template,
    templateTitle,
    key: uuid(),
    updatePoints() {
      this.pointsPossible = Number(calcMaxPoints(this.ratings));
    },
    scores,
    isGroupCriterion,
  };
}

/**
 * Rating factory function.
 */
export function createRating(
  points: number = 0,
  description: string = "",
  longDescription: string = "",
  id: string = "",
): Rating {
  return {
    points,
    description,
    longDescription,
    id,
    key: uuid(),
  };
}
