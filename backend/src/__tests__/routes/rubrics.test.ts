import { app } from "src/app";
import supertest from "supertest";
import { Server } from "http";
import { calcMaxPoints } from "../../../../frontend/src/utils/calculateMaxPoints";

const COURSE_ROUTE = "/api/courses";
const DEV_COURSE_ID = 15760;
const TEST_STUDENT_ID = 129878;
const TEST_STUDENT_NAME = "Clint Mccandless";
const TEST_STUDENT_ASURITE = "cmccand1";
const RUBRIC_DATA_ASSIGNMENT_ID = 6171684;
const TEST_RUBRIC_ID = 1034871;
let rubricAssessmentID = "";
// ... existing code ...
let server: Server | null = null;

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

const mockRubricSubmission = {
  id: 1,
  title: "'Data Transfer Reliability Metric Rubric",
  pointsPossible: 10,
  key: "13b72769-0e56-4f30-9bc0-8e39fc37db83",
  criteria: [
    {
      id: rubricAssessmentID,
      description: "C1",
      longDescription: "",
      ratings: [
        {
          id: "1031535_1768",
          description: "Well done!",
          longDescription: "",
          points: 5,
          key: "5ea17373-ed44-4245-95bc-b1a5d5b6fe42",
        },
      ],
      pointsPossible: 5,
      template: "",
      updatePoints() {
        this.pointsPossible = Number(calcMaxPoints(this.ratings));
      },
      scores: [],
      isGroupCriterion: true,
    },
  ],
};

// /**
//  * @route POST /courses/:courseID/rubrics
//  * @description Create a new rubric in a specific course.
//  */

describe("Rubric Router", () => {
  describe("given a course and assignment", () => {
    it("should create a new rubric", async () => {
      const rubricGetEndpoint = `${COURSE_ROUTE}/${DEV_COURSE_ID}/rubrics/${TEST_RUBRIC_ID}`;
      const rubricUpdateEndpoint = `${COURSE_ROUTE}/${DEV_COURSE_ID}/rubrics/${TEST_RUBRIC_ID}/${RUBRIC_DATA_ASSIGNMENT_ID}`;
      const putResponse = await supertest(app)
        .put(rubricUpdateEndpoint)
        .send(mockRubricSubmission)
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
