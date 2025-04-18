import { PaletteGradedSubmission, Submission } from "palette-types";

/**
 * Student Performance Metrics
 *
 * This module provides functions for calculating and analyzing student performance
 * based on their submissions and grades.
 */

const STUDENT_ID = 123456789;
const STUDENT_NAME = "John Doe";
const STUDENT_ASURITE = "jdoe";

const mockComment = {
  text_comment: "Data Transfer Reliability Comment",
  group_comment: false as const,
};
function getPointsForAdjective(adjective: string): number {
  const pointMap: Record<string, number> = {
    Excellent: 15,
    Outstanding: 15,
    Good: 10,
    Satisfactory: 8,
    Fair: 5,
    Poor: 3,
    Inadequate: 0,
  };

  return pointMap[adjective] || 5; // Default to middle value if adjective not found
}

function extractAdjectiveFromDescription(description: string): string {
  const words = description.split(" ");
  return words[0]; // The first word is the adjective
}

function generateRandomDescription(): string {
  const adjectives = [
    "Excellent",
    "Good",
    "Fair",
    "Poor",
    "Outstanding",
    "Satisfactory",
    "Inadequate",
  ];
  const nouns = [
    "work",
    "performance",
    "effort",
    "submission",
    "deliverable",
    "project",
    "assignment",
  ];

  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${randomAdjective} ${randomNoun}.`;
}

function generateMockGradedSubmission(): PaletteGradedSubmission {
  // Generate a single random description to use for both comment and points
  const randomDescription = generateRandomDescription();
  const adjective = extractAdjectiveFromDescription(randomDescription);
  const points = getPointsForAdjective(adjective);

  return {
    submission_id: 323764505,
    user: {
      id: STUDENT_ID,
      name: STUDENT_NAME,
      asurite: STUDENT_ASURITE,
    },
    rubric_assessment: {
      _6752: {
        rating_id: "1",
        comments: randomDescription,
        points: points,
      },
    },
    individual_comment: mockComment,
  };
}

/**
 * Calculate the total score for a submission
 * @param submission The graded submission to calculate the score for
 * @returns The total score as a number
 */
export function calculateSubmissionScore(
  submission: PaletteGradedSubmission
): number {
  if (!submission || !submission.rubric_assessment) return 0;

  return Object.values(submission.rubric_assessment).reduce(
    (total, assessment) => {
      return total + (assessment.points || 0);
    },
    0
  );
}
