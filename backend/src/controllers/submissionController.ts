import asyncHandler from "express-async-handler";
import { CoursesAPI } from "../services/courseRequests.js";
import { CanvasGradedSubmission, PaletteAPIResponse } from "palette-types";
import { GroupedSubmissions } from "palette-types/dist/types/GroupedSubmissions";

export const getSubmissions = asyncHandler(async (req, res) => {
  console.log(
    `getting submissions for assignment: ${req.params.assignment_id}`
  );
  const submissions = await CoursesAPI.getSubmissions(
    req.params.course_id,
    req.params.assignment_id
  );

  const apiResponse: PaletteAPIResponse<GroupedSubmissions> = {
    data: submissions,
    success: true,
    message: "Assignment submissions",
  };

  res.json(apiResponse);
});

export const submitGrades = asyncHandler(async (req, res) => {
  console.log("got some grades to submit");
  console.log("req.body::", req.body);
  const canvasResponse = await CoursesAPI.putSubmission(
    req.params.course_id,
    req.params.assignment_id,
    req.params.student_id,
    req.body as CanvasGradedSubmission
  );

  console.log(canvasResponse);

  const apiResponse: PaletteAPIResponse<null> = {
    success: true,
    message: "got some grades",
  };

  res.json(apiResponse);
});

export const updateSubmissionComment = asyncHandler(async (req, res) => {
  console.log("got a comment to update");
  console.log("req.body::", req.body);
  const canvasResponse = await CoursesAPI.putSubmissionComment(
    req.params.course_id,
    req.params.assignment_id,
    req.params.student_id,
    req.params.comment_id,
    { comment: req.body.comment as string }
  );
  console.log(canvasResponse);

  const apiResponse: PaletteAPIResponse<null> = {
    success: true,
    message: "got a comment",
  };

  res.json(apiResponse);
});
