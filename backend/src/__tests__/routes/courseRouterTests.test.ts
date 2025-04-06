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
const RUBRIC_DATA_ASSIGNMENT_ID = 6171684;
const TEST_RUBRIC_ID = 1034871;

const app = express();
app.use(express.json());
app.use("/api/courses", courseRouter);

const mockComment = {
  text_comment: "Data Transfer Reliability Comment",
  group_comment: false as const,
};

// {
//   "data": {
//     "id": 1031535,
//     "title": "Reliability",
//     "pointsPossible": 10,
//     "key": "13b72769-0e56-4f30-9bc0-8e39fc37db83",
//     "criteria": [
//       {
//         "id": "1031535_3559",
//         "description": "C1",
//         "longDescription": "",
//         "pointsPossible": 5,
//         "isGroupCriterion": true,
//         "key": "6cd0db17-cbbc-4417-b021-3ec2875d896d",
//         "ratings": [
//           {
//             "id": "1031535_1768",
//             "description": "Well done!",
//             "longDescription": "",
//             "points": 5,
//             "key": "5ea17373-ed44-4245-95bc-b1a5d5b6fe42"
//           },
//           {
//             "id": "1031535_1778",
//             "description": "Not included",
//             "longDescription": "",
//             "points": 0,
//             "key": "469ac510-a32c-420a-a679-e471bf4de73f"
//           }
//         ],
//         "scores": []
//       },
//       {
//         "id": "1031535_806",
//         "description": "C2",
//         "longDescription": "",
//         "pointsPossible": 5,
//         "isGroupCriterion": true,
//         "key": "6a19c3cf-76af-4260-80a5-c1376cb853bd",
//         "ratings": [
//           {
//             "id": "1031535_7422",
//             "description": "Well done!",
//             "longDescription": "",
//             "points": 5,
//             "key": "41952c82-693f-4375-aee1-1bdb5f06ac9c"
//           },
//           {
//             "id": "1031535_4894",
//             "description": "Not included",
//             "longDescription": "",
//             "points": 0,
//             "key": "cd1a3d15-6ccc-4c4c-9b0d-fbc1cea598b9"
//           }
//         ],
//         "scores": []
//       }
//     ]
//   },
//   "success": true,
//   "message": "Here is the rubric"
// }

const mockGradedSubmission: PaletteGradedSubmission = {
  submission_id: 323764505,
  user: {
    id: TEST_STUDENT_ID,
    name: TEST_STUDENT_NAME,
    asurite: TEST_STUDENT_ASURITE,
  },
  rubric_assessment: {
    "1034871_7532": {
      rating_id: "1",
      comments: "",
      points: 5,
    },
  },
  individual_comment: mockComment,
};

let server: any;
let commentIds: number[] = [];

beforeAll((done) => {
  server = app.listen(done);
});

afterAll((done) => {
  console.log("commentIds", commentIds);

  server.close(done);
});

/**
 * @route PUT /courses/:courseID/assignments/:assignmentID/submissions/:studentID
 * @description Submit grades for a specific assignment.
 */

// describe("Graded Submission Router", () => {
//   describe("given a course, assignment, and student", () => {
//     for (let i = 0; i < 1; i++) {
//       it("should submit grades for a specific course, assignment, and student", async () => {
//         const apiPutEndpoint = `${COURSE_ROUTE}/${DEV_COURSE_ID}/assignments/${TEST_ASSIGNMENT_ID}/submissions/${TEST_STUDENT_ID}`;
//         const apiGetEndpoint = `${COURSE_ROUTE}/${DEV_COURSE_ID}/assignments/${TEST_ASSIGNMENT_ID}/submissions`;

//         const putResponse = await supertest(app)
//           .put(apiPutEndpoint)
//           .send(mockGradedSubmission)
//           .expect(200);

//         const getResponse = await supertest(app)
//           .get(apiGetEndpoint)
//           .expect(200);

//         // console.log("putResponse", putResponse.body);

//         const submissions = getResponse.body.data as GroupedSubmissions;
//         const groupOneSubmissions = submissions["GROUP ONE"];
//         const testStudentSubmission = groupOneSubmissions[0];

//         expect(mockGradedSubmission.user.name).toBe(
//           testStudentSubmission.user.name
//         );
//         expect(mockGradedSubmission.user.asurite).toBe(
//           testStudentSubmission.user.asurite
//         );

//         expect(mockGradedSubmission.rubric_assessment).toEqual(
//           testStudentSubmission.rubricAssessment
//         );

//         // Verify that all comments match the mockComment
//         testStudentSubmission.comments.forEach((comment) => {
//           expect(comment.comment).toEqual(mockComment.text_comment);
//         });

//         // Add all comment IDs to the list if they're not already there so that they can be deleted after the test
//         testStudentSubmission.comments.forEach((comment) => {
//           if (!commentIds.includes(comment.id)) {
//             commentIds.push(comment.id);
//           }
//         });
//       });
//     }

//     it("should clean up comments after the test", async () => {
//       console.log("commentIds", commentIds);
//       // This ensures that all comments are deleted after the test
//       await Promise.all(
//         commentIds.map(async (commentId) => {
//           const deleteEndpoint = `${COURSE_ROUTE}/${DEV_COURSE_ID}/assignments/${TEST_ASSIGNMENT_ID}/submissions/${TEST_STUDENT_ID}/comments/${commentId}`;
//           const deleteResponse = await supertest(app)
//             .delete(deleteEndpoint)
//             .expect(200);
//           console.log(`Deleted comment ${commentId}:`, deleteResponse.body);
//         })
//       );
//     });
//   });
// });

// /**
//  * @route POST /courses/:courseID/rubrics
//  * @description Create a new rubric in a specific course.
//  */

describe("Rubric Router", () => {
  describe("given a course and assignment", () => {
    it("should create a new rubric", async () => {
      const rubricGetEndpoint = `${COURSE_ROUTE}/${DEV_COURSE_ID}/rubrics/${TEST_RUBRIC_ID}`;
      const rubricUpdateEndpoint = `${COURSE_ROUTE}/${DEV_COURSE_ID}/rubrics/${RUBRIC_DATA_ASSIGNMENT_ID}`;
      const putResponse = await supertest(app)
        .put(rubricUpdateEndpoint)
        .send(mockGradedSubmission)
        .expect(200);

      const getResponse = await supertest(app)
        .get(rubricGetEndpoint)
        .expect(200);

      console.log("putResponse: ", putResponse);
      console.log("getResponse: ", getResponse);
      // expect(response.status).toBe(200);
      // expect(response.body).toEqual({
      //   success: true,
      //   message: "New rubric created successfully",
      // });
    });
  });
});
