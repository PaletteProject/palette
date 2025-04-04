import asyncHandler from "express-async-handler";
import { CoursesAPI } from "../services/courseRequests.js";
import { PaletteAPIResponse, PaletteGradedSubmission } from "palette-types";
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

  const canvasResponse = await CoursesAPI.putSubmission(
    req.params.course_id,
    req.params.assignment_id,
    req.params.student_id,
    req.body as PaletteGradedSubmission
  );

  console.log("canvasResponse:", canvasResponse);

  const apiResponse: PaletteAPIResponse<null> = {
    success: true,
    message: "submitted grades",
  };

  res.json(apiResponse);
});

export const deleteComment = asyncHandler(async (req, res) => {
  console.log("deleting comment");

  const canvasResponse = await CoursesAPI.deleteComment(
    req.params.course_id,
    req.params.assignment_id,
    req.params.student_id,
    req.params.comment_id
  );

  const apiResponse: PaletteAPIResponse<null> = {
    success: true,
    message: "comment deleted",
  };

  res.json(apiResponse);
});
