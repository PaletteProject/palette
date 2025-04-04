import express, { response } from "express";
import supertest from "supertest";
import courseRouter from "../../routes/courseRouter.js";
import { PaletteGradedSubmission, GroupedSubmissions } from "palette-types";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

const COURSE_ROUTE = "/api/courses";
const DEV_COURSE_ID = 15760;
const TEST_ASSIGNMENT_ID = 6154972;
const TEST_STUDENT_ID = 129878;
const TEST_STUDENT_NAME = "Clint Mccandless";
const TEST_STUDENT_ASURITE = "cmccand1";

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
    "1031535_2226": {
      rating_id: "",
      comments: "",
      points: 0,
    },
    "1031535_8154": {
      rating_id: "",
      comments: "",
      points: 0,
    },
    "1031535_9264": {
      rating_id: "",
      comments: "",
      points: 0,
    },
    "1031535_15": {
      rating_id: "",
      comments: "",
      points: 0,
    },
    "1031535_7436": {
      rating_id: "",
      comments: "",
      points: 0,
    },
  },
  individual_comment: mockComment,
};

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
        const apiPutEndpoint = `${COURSE_ROUTE}/${DEV_COURSE_ID}/assignments/${TEST_ASSIGNMENT_ID}/submissions/${TEST_STUDENT_ID}`;
        const apiGetEndpoint = `${COURSE_ROUTE}/${DEV_COURSE_ID}/assignments/${TEST_ASSIGNMENT_ID}/submissions`;
        const originalBody = JSON.stringify(mockGradedSubmission);

        const putResponse = await supertest(app)
          .put(apiPutEndpoint)
          .send(mockGradedSubmission)
          .expect(200);

        // console.log("putResponse", putResponse.body);

        const getResponse = await supertest(app)
          .get(apiGetEndpoint)
          .expect(200);

        const submissions = getResponse.body.data as GroupedSubmissions;
        const groupOneSubmissions = submissions["GROUP ONE"];
        const testStudentSubmission = groupOneSubmissions[0];
        console.log("mockGradedSubmission:", mockGradedSubmission);
        console.log("submission:", testStudentSubmission);

        expect(mockGradedSubmission.user.name).toBe(
          testStudentSubmission.user.name
        );
        expect(mockGradedSubmission.user.asurite).toBe(
          testStudentSubmission.user.asurite
        );
        // console.log(
        //   "testStudentSubmission.rubricAssessment:",
        //   testStudentSubmission.rubricAssessment
        // );
        // console.log(
        //   "mockGradedSubmission.rubric_assessment:",
        //   mockGradedSubmission.rubric_assessment
        // );

        // console.log(
        //   "testStudentSubmission.comments:",
        //   testStudentSubmission.comments
        // );
        expect(mockGradedSubmission.rubric_assessment).toEqual(
          testStudentSubmission.rubricAssessment
        );

        // Verify that all comments match the mockComment
        testStudentSubmission.comments.forEach((comment) => {
          expect(comment.comment).toEqual(mockComment.text_comment);
        });

        // Verify the sent data wasn't modified
        // expect(JSON.stringify(mockGradedSubmission)).toBe(getResponse.body);
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
