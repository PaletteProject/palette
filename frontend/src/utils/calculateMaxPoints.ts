import { Rating } from "palette-types";

/**
 * Helper function to calculate a criterion's max point value when it's pulled in from the backend.
 * @param ratings - array of rating options for target criterion
 */
export const calcMaxPoints = (ratings: Rating[]): number => {
  // ensure ratings aren't empty
  if (ratings.length > 0) {
    return ratings.reduce(
      (max, current) => (current.points > max.points ? current : max),
      ratings[0],
    ).points;
  } else {
    return 0;
  }
};
