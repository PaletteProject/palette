/**
 * Unit tests for Rubric.ts
 */

// Mock uuid to ensure the key is predictable for testing

import { createRubric } from "@utils";
import { Criteria, Rubric } from "palette-types";
import { vi } from "vitest";

// Mock `uuid` library to ensure consistent UUID for testing
vi.mock("uuid", () => ({
  v4: vi.fn(() => "test-uuid"),
}));

describe("Rubric", () => {
  describe("createRubric", () => {
    it("should create a Rubric with default values", () => {
      const rubric = createRubric();

      // Assertions for default values
      expect(rubric.title).toBe("");
      expect(rubric.criteria).toHaveLength(1);
      expect(rubric.id).toBe("");
      expect(rubric.key).toBe("test-uuid"); // Mocked UUID
    });

    it("should create a Rubric with specified values", () => {
      const mockCriteria: Criteria[] = [
        {
          description: "Criterion 1",
          longDescription: "Description for Criterion 1",
          ratings: [],
          pointsPossible: 10,
          template: "",
          updatePoints: vi.fn(), // mocks the function
          key: "key-1",
          id: "mockCrit1",
        },
        {
          description: "Criterion 2",
          longDescription: "Description for Criterion 2",
          ratings: [],
          pointsPossible: 20,
          template: "",
          updatePoints: vi.fn(),
          key: "key-2",
          id: "mockCrit2",
        },
      ];

      const rubric: Rubric = createRubric("Test Rubric", mockCriteria, "123");

      // Assertions for specified values
      expect(rubric.title).toBe("Test Rubric");
      expect(rubric.criteria).toEqual(mockCriteria);
      expect(rubric.id).toBe("123");
      expect(rubric.key).toBe("test-uuid"); // Mocked UUID
    });
  });
});
