// Router for all /rubrics requests
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
// @ts-ignore
import { RubricCriterion } from '@models/types/rubricCriterion.ts';
// @ts-ignore
import { RubricRating } from '@models/types/rubricRating.ts';
import asyncHandler from 'express-async-handler';

const router = express.Router();
const prisma = new PrismaClient();

// defines validation for rubrics before being stored on the database
const validateRubric = [
  body('title')
    .isString()
    .notEmpty()
    .trim()
    .withMessage('Rubric does not have a title')
    .isLength({ max: 255 }) // max length: 255 characters
    .withMessage('Rubric title must not exceed 255 characters.'),
  body('rubricCriteria')
    .isArray({ min: 1 })
    .withMessage('Rubric must have at least one criterion.'),
  body('rubricCriteria.*.description') // * === all objects in the criteria array
    .isString()
    .notEmpty()
    .trim()
    .withMessage('Each criterion must have a description'),
  body('rubricCriteria.*.longDescription').optional().isString(),
  body('rubricCriteria.*.points')
    .isNumeric()
    .withMessage('points field must be numeric'),
];

router.post(
  '/',
  validateRubric,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({ errors: errors.array() });
    }

    const { title, rubricCriteria } = req.body;

    const newRubric = await prisma.rubric.create({
      data: {
        title,
        rubricCriteria: {
          create: rubricCriteria.map((criterion: RubricCriterion) => ({
            description: criterion.description,
            longDescription: criterion.longDescription, // Make sure to include this if it's required
            points: criterion.points,
            ratings: {
              create: criterion.ratings.map((rating: RubricRating) => ({
                description: rating.description,
                points: rating.points,
              })),
            },
          })),
        },
      },
    });
    res.status(201).send(newRubric);
  })
);

// fetch a specific rubric by ID
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log(`trying to fetch rubric with id=${id}`);
    const rubric = await prisma.rubric.findUnique({
      where: { id: Number(id) },
      include: {
        rubricCriteria: {
          include: {
            ratings: true,
          },
        },
      },
    });

    console.log('found ', rubric);

    // Check if the rubric was found
    if (!rubric) {
      res.status(404).send({ error: 'Rubric not found' });
    }

    res.status(200).send(rubric); // Send the found rubric back
  })
);

/**
 * Return all rubrics from the database.
 *
 * "_" is added in front of req to tell eslint that it's not being used but still has to be there anyway.
 */
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    // gets all rubrics with their criteria and ratings
    const rubrics = await prisma.rubric.findMany({
      include: {
        rubricCriteria: {
          include: {
            ratings: true,
          },
        },
      },
    });
    res.status(200).send(rubrics); // Send back list of all rubrics
  })
);

// update an existing rubric

router.put(
  '/:id',
  validateRubric,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      title,
      contextId,
      contextType,
      pointsPossible,
      reusable,
      readOnly,
      freeFormCriterionComments,
      hideScoreTotal,
      content,
      published,
      authorId,
      rubricCriteria,
    } = req.body;

    try {
      // First, check if the rubric exists
      const existingRubric = await prisma.rubric.findUnique({
        where: { id: Number(id) },
        include: {
          rubricCriteria: {
            include: {
              ratings: true,
            },
          },
        },
      });

      if (!existingRubric) {
        // Create new rubric if it doesn't exist
        const newRubric = await prisma.rubric.create({
          data: {
            title,
            contextId,
            contextType,
            pointsPossible,
            reusable,
            readOnly,
            freeFormCriterionComments,
            hideScoreTotal,
            content,
            published,
            authorId,
            rubricCriteria: {
              create: rubricCriteria.map((criterion: RubricCriterion) => ({
                description: criterion.description,
                longDescription: criterion.longDescription,
                points: criterion.points,
                criterionUseRange: criterion.criterionUseRange,
                ratings: {
                  create: criterion.ratings.map((rating: RubricRating) => ({
                    description: rating.description,
                    longDescription: rating.longDescription,
                    points: rating.points,
                    criterionUseRange: rating.criterionUseRange,
                  })),
                },
              })),
            },
          },
        });
        res.status(201).json(newRubric);
      }

      // If rubric exists, update it with new data
      // First, delete all existing criteria and their ratings
      await prisma.rubricCriterion.deleteMany({
        where: { rubricId: Number(id) },
      });

      // Then create new criteria and ratings
      const updatedRubric = await prisma.rubric.update({
        where: { id: Number(id) },
        data: {
          title,
          contextId,
          contextType,
          pointsPossible,
          reusable,
          readOnly,
          freeFormCriterionComments,
          hideScoreTotal,
          content,
          published,
          authorId,
          rubricCriteria: {
            create: rubricCriteria.map((criterion: RubricCriterion) => ({
              description: criterion.description,
              longDescription: criterion.longDescription,
              points: criterion.points,
              criterionUseRange: criterion.criterionUseRange,
              ratings: {
                create: criterion.ratings.map((rating: RubricRating) => ({
                  description: rating.description,
                  longDescription: rating.longDescription,
                  points: rating.points,
                  criterionUseRange: rating.criterionUseRange,
                })),
              },
            })),
          },
        },
        include: {
          rubricCriteria: {
            include: {
              ratings: true,
            },
          },
        },
      });

      res.status(204).json(updatedRubric);
    } catch (error) {
      console.error('Error updating rubric:', error);
      res.status(500).json({ error: 'Failed to update rubric' });
    }
  })
);

// get a rubric by title
router.get(
  '/title/:title',
  asyncHandler(async (req: Request, res: Response) => {
    const { title } = req.params;
    const rubric = await prisma.rubric.findFirst({
      where: { title },
      include: {
        rubricCriteria: {
          include: {
            ratings: true,
          },
        },
      },
    });

    if (!rubric) {
      res.status(404).json({ error: 'Rubric not found' });
    }

    res.status(200).json(rubric);
  })
);

// delete an existing rubric
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await prisma.rubric.delete({
      where: { id: Number(id) },
    });
    res.status(204).send(); // Deletion was successful
  })
);

export default router;
