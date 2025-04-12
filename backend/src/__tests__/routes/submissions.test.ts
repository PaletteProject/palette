import express from "express";
import supertest from "supertest";
import courseRouter from "../../routes/courseRouter.js";
import { PaletteGradedSubmission, GroupedSubmissions } from "palette-types";
import dotenv from "dotenv";
import { Server } from "http";

dotenv.config({ path: ".env.test" });

const COURSE_ROUTE = "/api/courses";
const COURSE_ID = 15760;
const ASSIGNMENT_ID = 6154972;
const STUDENT_ID = 129878;
const STUDENT_NAME = "Clint Mccandless";
const STUDENT_ASURITE = "cmccand1";
const TEST_COUNT = 10; // Change this to fully test the metric. Planning to config this number the be reduced when doing GitHub Actions CI.

const app = express();
app.use(express.json());
app.use("/api/courses", courseRouter);

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

let server: Server | null = null;
const commentIds: number[] = [];

beforeAll(() => {
  server = app.listen();
});

afterAll((done) => {
  if (server) {
    server.close(done);
  } else {
    done();
  }
});

/**
 * @route PUT /courses/:courseID/assignments/:assignmentID/submissions/:studentID
 * @description Submit grades for a specific assignment.
 */

describe("Graded Submission Router", () => {
  describe("given a course, assignment, and student", () => {
    for (let i = 0; i < TEST_COUNT; i++) {
      it("should submit grades for a specific course, assignment, and student", async () => {
        const apiPutEndpoint = `${COURSE_ROUTE}/${COURSE_ID}/assignments/${ASSIGNMENT_ID}/submissions/${STUDENT_ID}`;
        const apiGetEndpoint = `${COURSE_ROUTE}/${COURSE_ID}/assignments/${ASSIGNMENT_ID}/submissions`;

        const mockGradedSubmission = generateMockGradedSubmission();

        const putResponse = await supertest(app)
          .put(apiPutEndpoint)
          .send(mockGradedSubmission)
          .expect(200);

        const getResponse = await supertest(app)
          .get(apiGetEndpoint)
          .expect(200);

        console.log("putResponse", putResponse.body);

        const getResponseBody = getResponse.body as {
          data: GroupedSubmissions;
        };
        const submissions = getResponseBody.data;
        const groupOneSubmissions = submissions["GROUP ONE"];
        const testStudentSubmission = groupOneSubmissions[0];

        expect(mockGradedSubmission.user.name).toBe(
          testStudentSubmission.user.name
        );
        expect(mockGradedSubmission.user.asurite).toBe(
          testStudentSubmission.user.asurite
        );

        expect(mockGradedSubmission.rubric_assessment).toEqual(
          testStudentSubmission.rubricAssessment
        );

        // Verify that all comments match the mockComment
        testStudentSubmission.comments.forEach((comment) => {
          expect(comment.comment).toEqual(mockComment.text_comment);
        });

        // Add all comment IDs to the list if they're not already there so that they can be deleted after the test
        testStudentSubmission.comments.forEach((comment) => {
          if (!commentIds.includes(comment.id)) {
            commentIds.push(comment.id);
          }
        });
      });
    }

    it("should clean up comments after the test", async () => {
      // This ensures that all comments are deleted after the test
      await Promise.all(
        commentIds.map(async (commentId) => {
          const deleteEndpoint = `${COURSE_ROUTE}/${COURSE_ID}/assignments/${ASSIGNMENT_ID}/submissions/${STUDENT_ID}/comments/${commentId}`;
          const deleteResponse = await supertest(app)
            .delete(deleteEndpoint)
            .expect(200);
          console.log("deleteResponse", deleteResponse.body);
        })
      );
    });
  });
});
