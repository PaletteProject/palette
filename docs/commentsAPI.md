# Using the Canvas Comments API

## Adding an individual submission comment

This type of comment is easily seen along with the grade. It only shows up for the target student.

```http request
PUT https://canvas.asu.edu/api/v1/courses/:course_id/assignments/:assignment_id/submissions/:user_id
```

```json
{
  "comment": {
    "text_comment": "ABSOLUTELY STUNNING WORK",
    "group_comment": false
  }
}
```

## Adding a group submission comment

This type of comment is displayed the exact same as an individual submission comment, but is visible by everyone in
the project group.

```http request
PUT https://canvas.asu.edu/api/v1/courses/:course_id/assignments/:assignment_id/submissions/:user_id
```

```json
{
  "comment": {
    "text_comment": "ABSOLUTELY STUNNING WORK EVERYONE",
    "group_comment": true
  }
}
```

## Adding a criteria comment

This type of comment is displayed directly in the rubric under its associated criteria. Not typically utilized.

```http request
PUT https://canvas.asu.edu/api/v1/courses/:course_id/assignments/:assignment_id/submissions/:user_id
```

```json
{
  "rubric_assessment": {
    "criteria1": {
      "points": 10,
      "rating_id": "rat1",
      "comments": "Great work on this criterion!"
    },
    "criteria2": {
      "points": 5,
      "rating_id": "rat2",
      "comments": "Met expectations perfectly."
    }
  }
}
```
