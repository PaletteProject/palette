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
      settings.preferences?.defaultRatings?.maxDefaultPoints ?? 5,
      settings.preferences?.defaultRatings?.maxDefaultDescription ??
        "Update the max description",
    ),
    createRating(
      settings.preferences?.defaultRatings?.minDefaultPoints ?? 0,
      settings.preferences?.defaultRatings?.minDefaultDescription ??
        "Update the min description",
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
 * Options object for createCriterion to only pass required optional params.
 */
interface CriterionOptions {
  description?: string;
  longDescription?: string;
  ratings?: Rating[];
  points?: number;
  id?: string;
  template?: string;
  templateTitle?: string;
  scores?: number[];
  isGroupCriterion?: boolean;
}

/**
 * Criterion factory function.
 */
export function createCriterion(
  settings: Settings,
  {
    description = "",
    longDescription = "",
    ratings = populateDefaultRatings(settings),
    points = ratings.reduce((sum, rating) => sum + rating.points, 0),
    id = "",
    template = "",
    templateTitle = "",
    scores = [],
    isGroupCriterion = true,
  }: CriterionOptions = {},
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
