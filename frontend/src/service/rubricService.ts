/**
 * rubricService.ts
 *
 * Service layer for rubric-related API calls.
 */
import { useFetch } from "@hooks";
import { Assignment, Course, Rubric } from "palette-types";
import { useRubric } from "@context";
import { createRubric } from "@utils";

export const updateRubric = async (
  activeCourse: Course,
  activeAssignment: Assignment,
  activeRubric: Rubric,
) => {
  const { fetchData: putRubric, response: putRubricResponse } = useFetch(
    `/courses/${activeCourse?.id}/rubrics/${activeAssignment?.rubricId}/${activeAssignment?.id}`,
    {
      method: "PUT",
      body: JSON.stringify(activeRubric),
    },
  );

  await putRubric();

  return putRubricResponse;
};

export const addRubric = async (
  activeCourse: Course,
  activeAssignment: Assignment,
  activeRubric: Rubric,
) => {
  const { fetchData: postRubric, response: postRubricResponse } = useFetch(
    `/courses/${activeCourse?.id}/rubrics/${activeAssignment?.id}`,
    {
      method: "POST",
      body: JSON.stringify(activeRubric),
    },
  );

  await postRubric();

  return postRubricResponse;
};

/**
 * Retrieve the active rubric for target course and assignment and update Rubric context with new data. If a rubric
 * doesn't exist, create a new one.
 * @param activeCourse target course
 * @param activeAssignment target assignment
 */
export const getRubric = async (
  activeCourse: Course,
  activeAssignment: Assignment,
) => {
  const { setActiveRubric } = useRubric();

  const { fetchData: getRubric } = useFetch<Rubric>(
    `/courses/${activeCourse?.id}/rubrics/${activeAssignment?.rubricId}`,
  );

  try {
    const response = await getRubric();
    setActiveRubric((response.data as Rubric) ?? createRubric());
  } catch (error) {
    console.error("Failed to fetch rubric: ", error);
    setActiveRubric(createRubric());
  }
};
