import express from "express";
import supertest from "supertest";
import { Server } from "http";
import { calcMaxPoints } from "../../../../frontend/src/utils/calculateMaxPoints";
import courseRouter from "../../routes/courseRouter.js";
import { Criteria, Rating } from "../../../../palette-types";
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

function generateMockRubricSubmission() {
  return {
    id: RUBRIC_ID,
    title: "Rubric Data Reliability Metric",
    pointsPossible: 10,
    key: "1a26e0ba-5fef-4959-8303-933196bc5795",
    criteria: [
      {
        id: "_7158",
        description: generateRandomDescription(),
        longDescription: generateRandomDescription(),
        ratings: [
          {
            id: "blank",
            description: "Rating 1",
            longDescription: generateRandomDescription(),
            points: getPointsForAdjective(
              extractAdjectiveFromDescription(generateRandomDescription())
            ),
            key: "a86e75cb-5532-4435-b40c-1647a1a338db",
          },
          {
            id: "blank2",
            description: "Rating 2",
            longDescription: generateRandomDescription(),
            points: getPointsForAdjective(
              extractAdjectiveFromDescription(generateRandomDescription())
            ),
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
        description: generateRandomDescription(),
        longDescription: generateRandomDescription(),
        ratings: [
          {
            id: "_791",
            description: "Rating 1",
            longDescription: generateRandomDescription(),
            points: getPointsForAdjective(
              extractAdjectiveFromDescription(generateRandomDescription())
            ),
            key: "976aea74-241b-4428-9eff-d4f305948174",
          },
          {
            id: "_8542",
            description: "Rating 2",
            longDescription: generateRandomDescription(),
            points: getPointsForAdjective(
              extractAdjectiveFromDescription(generateRandomDescription())
            ),
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
}

// Replace the mockRubricSubmission object with a call to the function

// /**
//  * @route POST /courses/:courseID/rubrics
//  * @description Create a new rubric in a specific course.
//  */

describe("Rubric Router", () => {
  describe("given a course and assignment", () => {
    for (let i = 0; i < 100; i++) {
      it("should create a new rubric", async () => {
        const rubricGetEndpoint = `${COURSE_ROUTE}/${COURSE_ID}/rubrics/${RUBRIC_ID}`;
        const rubricUpdateEndpoint = `${COURSE_ROUTE}/${COURSE_ID}/rubrics/${RUBRIC_ID}/${ASSIGNMENT_ID}`;
        const mockRubricSubmission = generateMockRubricSubmission();
        const putResponse = await supertest(app)
          .put(rubricUpdateEndpoint)
          .send(mockRubricSubmission)
          .expect(200);

        const getResponse = await supertest(app)
          .get(rubricGetEndpoint)
          .expect(200);

        const putRubric = putResponse.body.data;
        const getRubric = getResponse.body.data;

        console.log("putRubric: ", putRubric);
        console.log("getRubric: ", getRubric);

        expect(putRubric.id).toEqual(getRubric.id);
        expect(putRubric.title).toEqual(getRubric.title);
        expect(putRubric.points_possible).toEqual(getRubric.pointsPossible);
        const putRubricCriteria = putRubric.data;
        const getRubricCriteria = getRubric.criteria;

        // Compare all criteria
        expect(putRubricCriteria.length).toEqual(getRubricCriteria.length);

        putRubricCriteria.forEach((putCriterion: Criteria, index: number) => {
          const getCriterion = getRubricCriteria[index];

          expect(getCriterion.id).toEqual(putCriterion.id);
          expect(getCriterion.description).toEqual(putCriterion.description);
          expect(getCriterion.long_description).toEqual(
            putCriterion.longDescription
          );
          expect(getCriterion.points).toEqual(putCriterion.pointsPossible);

          // Compare ratings if they exist
          if (putCriterion.ratings && getCriterion.ratings) {
            expect(putCriterion.ratings.length).toEqual(
              getCriterion.ratings.length
            );

            putCriterion.ratings.forEach(
              (putRating: Rating, ratingIndex: number) => {
                const getRating = getCriterion.ratings[ratingIndex];
                expect(putRating.id).toEqual(getRating.id);
                expect(putRating.description).toEqual(getRating.description);
                expect(putRating.points).toEqual(getRating.points);
              }
            );
          }
        });
      });
    }
  });
});
