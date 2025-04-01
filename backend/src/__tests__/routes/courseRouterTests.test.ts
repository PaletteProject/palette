import express, { response } from "express";
import supertest from "supertest";
import courseRouter from "../../routes/courseRouter.js";
import { CanvasGradedSubmission, PaletteGradedSubmission } from "palette-types";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

const COURSE_ROUTE = "/api/courses";
const DEV_COURSE_ID = 15760;
const TEST_ASSIGNMENT_ID = 6154972;
const TEST_STUDENT_ID = 1278183;
const CLINT_ID = 129878;
const MATT_ID = 862878;
const NODE_ENV = "test";

const app = express();
app.use(express.json());
app.use("/api/courses", courseRouter);

const mockGradedSubmission: PaletteGradedSubmission = {
  submission_id: 316761977,
  user: { id: 1, name: "Clint", asurite: "clint" },
  rubric_assessment: {
    "1012112_5159": { points: 10, rating_id: "1", comments: "Test Comments" },
    "1012112_7662": { points: 10, rating_id: "1", comments: "Test Comments" },
    "1012112_9754": { points: 10, rating_id: "1", comments: "Test Comments" },
  },
  group_comment: {
    text_comment: "Test Group Comment",
    group_comment: true,
    sent: false,
  },
  individual_comment: {
    text_comment: "Test Individual Comment",
    group_comment: false,
  },
};

const submissionBody = {
  submission_id: mockGradedSubmission.submission_id,
  user: mockGradedSubmission.user,
  rubric_assessment: mockGradedSubmission.rubric_assessment,
  comment: {
    text_comment: mockGradedSubmission.group_comment?.text_comment,
    group_comment: mockGradedSubmission.group_comment?.group_comment,
  },
} as CanvasGradedSubmission;

let server: any;

beforeAll((done) => {
  server = app.listen(done);
});

afterAll((done) => {
  server.close(done);
});

/**
 * @route PUT /courses/:courseID/assignments/:assignmentID/submissions/:studentID
 * @description Submit grades for a specific assignment.
 */

for (let i = 0; i < 1; i++) {
  describe("Graded Submission Router", () => {
    describe("given a course, assignment, and student", () => {
      it("should submit grades for a specific course, assignment, and student", async () => {
        const apiPutEndpoint = `${COURSE_ROUTE}/${DEV_COURSE_ID}/assignments/${TEST_ASSIGNMENT_ID}/submissions/${CLINT_ID}`;
        const apiGetEndpoint = `${COURSE_ROUTE}/${DEV_COURSE_ID}/assignments/${TEST_ASSIGNMENT_ID}/submissions`;
        const originalBody = JSON.stringify(submissionBody);

        const putResponse = await supertest(app)
          .put(apiPutEndpoint)
          .send(submissionBody)
          .expect(200);

        // const getResponse = await supertest(app)
        //   .get(apiGetEndpoint)
        //   .expect(200);

        // // Verify the sent data wasn't modified
        // expect(JSON.stringify(submissionBody)).toBe(originalBody);
        // expect(putResponse.body).toEqual({
        //   success: true,
        //   message: "submitted grades",
        //   data: expect.any(Object),
        // });
        // console.log("putResponse", putResponse.body);
        // console.log("getResponse", getResponse.body.data);
      });
    });
  });
  console.log(`Test ${i + 1} completed`);
}

// /**
//  * @route POST /courses/:courseID/rubrics
//  * @description Create a new rubric in a specific course.
//  */

// describe("Rubric Router", () => {
//   describe("given a course and assignment", () => {
//     it("should create a new rubric", async () => {
//       const response = await supertest(app).post(
//         `${COURSE_ROUTE}/${DEV_COURSE_ID}/rubrics`
//       );

//       expect(response.status).toBe(200);
//       expect(response.body).toEqual({
//         success: true,
//         message: "New rubric created successfully",
//       });
//     });
//   });
// });

// /**
//  * @route PUT /courses/:course_id/rubrics/:id
//  * @description Update a rubric by its ID in a specific course.
//  */
// describe("Rubric Router", () => {
//   describe("given a course and rubric ID", () => {
//     it("should update a rubric", async () => {
//       const response = await supertest(app).put(
//         `${COURSE_ROUTE}/${DEV_COURSE_ID}/rubrics/${TEST_ASSIGNMENT_ID}`
//       );

//       expect(response.status).toBe(200);
//       expect(response.body).toEqual({
//         success: true,
//         message: "Rubric updated successfully!",
//       });
//     });
//   });
// });
