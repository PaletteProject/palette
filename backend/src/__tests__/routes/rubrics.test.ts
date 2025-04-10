import express from "express";
import supertest from "supertest";
import { Server } from "http";
import { calcMaxPoints } from "../../../../frontend/src/utils/calculateMaxPoints";
import courseRouter from "../../routes/courseRouter.js";

const COURSE_ROUTE = "/api/courses";
const COURSE_ID = 15760;
const ASSIGNMENT_ID = 6171684;
const RUBRIC_ID = 1034872;

const app = express();
app.use(express.json());
app.use("/api/courses", courseRouter);

let server: Server | null = null;

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

const mockRubricSubmission = {
  id: RUBRIC_ID,
  title: "Rubric Data Reliability Metric",
  pointsPossible: 10,
  key: "1a26e0ba-5fef-4959-8303-933196bc5795",
  criteria: [
    {
      id: "_7158",
      description: "Description of criterion",
      longDescription: "",
      ratings: [
        {
          id: "blank",
          description: "Full marks",
          longDescription: "",
          points: 15,
          key: "a86e75cb-5532-4435-b40c-1647a1a338db",
        },
        {
          id: "blank2",
          description: "No marks",
          longDescription: "",
          points: 0,
          key: "43cdfd36-248e-4515-9c6b-d92f5cea8f27",
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
    {
      id: "_9287",
      description: "Description of criterion 2",
      longDescription: "",
      ratings: [
        {
          id: "_791",
          description: "Full marks",
          longDescription: "",
          points: 15,
          key: "976aea74-241b-4428-9eff-d4f305948174",
        },
        {
          id: "_8542",
          description: "No marks",
          longDescription: "",
          points: 0,
          key: "c29a2932-fbfc-48c3-93b9-720f97850046",
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
    for (let i = 0; i < 1; i++) {
      it("should create a new rubric", async () => {
        const rubricGetEndpoint = `${COURSE_ROUTE}/${COURSE_ID}/rubrics/${RUBRIC_ID}`;
        const rubricUpdateEndpoint = `${COURSE_ROUTE}/${COURSE_ID}/rubrics/${RUBRIC_ID}/${ASSIGNMENT_ID}`;
        const putResponse = await supertest(app)
          .put(rubricUpdateEndpoint)
          .send(mockRubricSubmission)
          .expect(200);

        const getResponse = await supertest(app)
          .get(rubricGetEndpoint)
          .expect(200);

        console.log("putResponse: ", putResponse);
        console.log("getResponse: ", getResponse);
      });
    }
  });
});
