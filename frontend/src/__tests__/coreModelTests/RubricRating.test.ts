/**
 * Unit tests for RubricRating.ts
 */

import { createRating } from "@utils";
import { describe, expect, it, vi } from "vitest"; // Mock uuid to ensure predictable values

// Mock uuid to ensure predictable values
vi.mock("uuid", () => ({
  v4: vi.fn(() => "test-uuid"),
}));

describe("RubricRating", () => {
  describe("createRating", () => {
    it("should create a RubricRating with default values", () => {
      const rating = createRating();

      expect(rating.points).toBe(0);
      expect(rating.description).toBe("");
      expect(rating.longDescription).toBe("");
      expect(rating.id).toBe(""); // rating created on frontend should not have id yet
      expect(rating.key).toBe("test-uuid"); // mocked UUID
    });

    it("should create a RubricRating with specified values", () => {
      const rating = createRating(
        10,
        "Test Rating",
        "Detailed description",
        "123",
      );

      expect(rating.points).toBe(10);
      expect(rating.description).toBe("Test Rating");
      expect(rating.longDescription).toBe("Detailed description");
      expect(rating.id).toBe("123");
      expect(rating.key).toBe("test-uuid");
    });
  });
});
