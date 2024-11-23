import asyncHandler from "express-async-handler";
import { CoursesAPI } from "../services/courseRequests.js";
import { PaletteAPIResponse } from "palette-types";
import { GroupedSubmissions } from "palette-types/dist/types/GroupedSubmissions";

export const getSubmissions = asyncHandler(async (req, res) => {
  console.log(
    `getting submissions for assignment: ${req.params.assignment_id}`,
  );
  const submissions = await CoursesAPI.getSubmissions(
    req.params.course_id,
    req.params.assignment_id,
  );

  const apiResponse: PaletteAPIResponse<GroupedSubmissions> = {
    data: submissions,
    success: true,
    message: "Assignment submissions",
  };

  res.json(apiResponse);
});
