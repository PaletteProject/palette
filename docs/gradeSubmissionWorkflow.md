# Grading a Submission with the Canvas API

The following workflow results in successfully grading a submission from Palette.

1. Get the rubric for the assignment.
2. Get all student submissions for the assignment.
3. Apply grading and comments to submission with a rubric assessment.

## Preconditions:

- An assignment must have an associated rubric.
    - The RubricAssessment specifically targets the `criterion_id` and `rating_id` fields.
    - Without a valid rubric association, the assessment will get thrown away by Canvas.

## Get Rubric

- Fetch the associated rubric and load into the Palette grading view.

## GET Submissions for an Assignment

Format: `GET {base_url}/courses/:course_id/assignments/assignment_id/submissions`

Example: `GET {base_url}/courses/15760/assignments/5739158/submissions?include[]=group&include[]=user&grouped=true`

- This query string ensures that group and user information are provided with the submission.
- It should group submissions by project group, but it's not working yet.

- The application will display all submissions for an assignment with the student's asurite ID, group name, and a
  progress indicator.
- When the user selects a submission, the program transitions to the grading view.

## Building the Rubric Assessment

A Rubric Assessment in Canvas is used to evaluate a student's work against the associated rubric. It captures scores
and feedback for one specific submission. It's formatted as:

```json
{
  "rubric_assessment": {
    "crit1": {
      "points": 10,
      "rating_id": "rat1",
      "comments": "Excellent argument with clear structure."
    },
    "crit2": {
      "points": 3,
      "rating_id": "rat2",
      "comments": "Some grammar errors, but understandable."
    }
  }
}
```

Once a submission is graded within Palette, tha application will create a Canvas Rubric Assessment to apply the
scoring and any comments or feedback.

It must map to the rubric assessment data structure as described [in the Canvas docs](https://canvas.instructure.
com/doc/api/rubrics.html#method.rubric_assessments.create)

With the rubric_association_id known, the final rubric assessment (defined in CanvasAddRubricAssessmentRequest.ts) can
be
exported to Canvas with:

```
POST /api/v1/courses/:course_id/rubric_associations/:rubric_association_id/rubric_assessments
```

