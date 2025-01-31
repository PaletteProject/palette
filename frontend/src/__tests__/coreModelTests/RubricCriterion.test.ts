/**
 * Unit tests for RubricCriterion.ts
 */

import { Rating } from "palette-types";

import { describe, expect, it, vi } from "vitest";
import { calcMaxPoints, createCriterion, createRating } from "@utils";

// Mock uuid to ensure predictable values
vi.mock("uuid", () => ({
  v4: vi.fn(() => "test-uuid"),
}));

// rubric criterion test suite
describe("RubricCriterion", () => {
  // each describe is a unit test
  describe("createCriterion", () => {
    it("should create a Criterion object with default values", () => {
      const criterion = createCriterion();

      expect(criterion.description).toBe("");
      expect(criterion.longDescription).toBe("");
      expect(criterion.pointsPossible).toBe(0);
      expect(criterion.ratings).toHaveLength(2);
      expect(criterion.id).toBe("");
      expect(criterion.key).toBe("test-uuid"); // Mocked UUID
    });

    it("should create a Criterion object with specified values to simulate an import from Canvas", () => {
      const mockRatings: Rating[] = [
        createRating(5, "Rating 1"),
        createRating(10, "Rating 2"),
      ];
      const criterion = createCriterion(
        "Criterion Title",
        "Detailed description",
        15,
        mockRatings,
        "123",
      );

      expect(criterion.description).toBe("Criterion Title");
      expect(criterion.longDescription).toBe("Detailed description");
      expect(criterion.pointsPossible).toBe(15);
      expect(criterion.ratings).toEqual(mockRatings);
      expect(criterion.id).toBe("123");
      expect(criterion.key).toBe("test-uuid");
    });
  });

  describe("calcMaxPoints", () => {
    it("should return the maximum points value from the ratings", () => {
      const ratings: Rating[] = [
        createRating(5, "Low"),
        createRating(15, "Medium"),
        createRating(10, "High"),
      ];
      const maxPoints = calcMaxPoints(ratings);

      expect(maxPoints).toBe(15);
    });

    it("should return 0 if ratings array is empty", () => {
      const maxPoints = calcMaxPoints([]);
      expect(maxPoints).toBe(0);
    });
  });

  describe("updatePoints", () => {
    it("should update the points to the maximum rating points in the ratings array", () => {
      const ratings: Rating[] = [
        createRating(8, "Average"),
        createRating(20, "Excellent"),
      ];
      const criterion = createCriterion(
        "Criterion with Ratings",
        "Long Description",
        0,
        ratings,
      );

      // Call updatePoints to update the points based on the ratings
      criterion.updatePoints();

      expect(criterion.pointsPossible).toBe(20); // Should be the maximum points in ratings
    });
  });
});
