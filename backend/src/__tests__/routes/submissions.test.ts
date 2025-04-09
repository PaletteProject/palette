import express from "express";
import supertest from "supertest";
import courseRouter from "../../routes/courseRouter.js";
import {
  PaletteGradedSubmission,
  GroupedSubmissions,
  Rubric,
} from "palette-types";
import dotenv from "dotenv";
import { Server } from "http";

dotenv.config({ path: ".env.test" });

const COURSE_ROUTE = "/api/courses";
const DEV_COURSE_ID = 15760;
const TEST_ASSIGNMENT_ID = 6154972;
const TEST_STUDENT_ID = 129878;
const TEST_STUDENT_NAME = "Clint Mccandless";
const TEST_STUDENT_ASURITE = "cmccand1";
const TEST_RUBRIC_ID = 1034871;
let rubricAssessmentID = "";

const app = express();
app.use(express.json());
app.use("/api/courses", courseRouter);

const mockComment = {
  text_comment: "Data Transfer Reliability Comment",
  group_comment: false as const,
};

const mockGradedSubmission: PaletteGradedSubmission = {
  submission_id: 323764505,
  user: {
    id: TEST_STUDENT_ID,
    name: TEST_STUDENT_NAME,
    asurite: TEST_STUDENT_ASURITE,
  },
  rubric_assessment: {
    [rubricAssessmentID]: {
      rating_id: "1",
      comments: "",
      points: 5,
    },
  },
  individual_comment: mockComment,
};

let server: Server | null = null;
const commentIds: number[] = [];

beforeAll(() => {
  server = app.listen();
});

afterAll((done) => {
  console.log("rubricAssessmentID !", rubricAssessmentID);
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
    for (let i = 0; i < 1; i++) {
      it("should submit grades for a specific course, assignment, and student", async () => {
        const apiPutEndpoint = `${COURSE_ROUTE}/${DEV_COURSE_ID}/assignments/${TEST_ASSIGNMENT_ID}/submissions/${TEST_STUDENT_ID}`;
        const apiGetEndpoint = `${COURSE_ROUTE}/${DEV_COURSE_ID}/assignments/${TEST_ASSIGNMENT_ID}/submissions`;

        const getRubricEndpoint = `${COURSE_ROUTE}/${DEV_COURSE_ID}/rubrics/${TEST_RUBRIC_ID}`;
        const getRubricResponse = await supertest(app)
          .get(getRubricEndpoint)
          .expect(200);

        const rubric = getRubricResponse.body.data as Rubric;
        rubricAssessmentID = rubric.criteria[0].id as string;
        console.log("rubric assessment id", rubricAssessmentID);

        const putResponse = await supertest(app)
          .put(apiPutEndpoint)
          .send(mockGradedSubmission)
          .expect(200);

        const getResponse = await supertest(app)
          .get(apiGetEndpoint)
          .expect(200);

        console.log("putResponse", putResponse.body);

        const submissions = getResponse.body.data as GroupedSubmissions;
        const groupOneSubmissions = submissions["GROUP ONE"];
        const testStudentSubmission = groupOneSubmissions[0];

        expect(mockGradedSubmission.user.name).toBe(
          testStudentSubmission.user.name,
        );
        expect(mockGradedSubmission.user.asurite).toBe(
          testStudentSubmission.user.asurite,
        );

        expect(mockGradedSubmission.rubric_assessment).toEqual(
          testStudentSubmission.rubricAssessment,
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
          const deleteEndpoint = `${COURSE_ROUTE}/${DEV_COURSE_ID}/assignments/${TEST_ASSIGNMENT_ID}/submissions/${TEST_STUDENT_ID}/comments/${commentId}`;
          const deleteResponse = await supertest(app)
            .delete(deleteEndpoint)
            .expect(200);
          console.log("deleteResponse", deleteResponse.body);
        }),
      );
    });
  });
});
