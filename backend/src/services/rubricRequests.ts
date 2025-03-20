import {
  CanvasRubric,
  CreateRubricResponse,
  DeleteRubricResponse,
  Rubric,
  RubricRequestBody,
  UpdateRubricResponse,
} from "palette-types";
import { fetchAPI } from "../utils/fetchAPI.js";
import { toPaletteFormat } from "../utils/rubricUtils.js";

/**
 * API methods for interacting with Canvas Rubrics.
 */
export const RubricsAPI = {
  /**
   * Create a new rubric in a specific course.
   * @param request - The request object containing rubric details.
   * @returns A promise that resolves to the created rubric response.
   */
  async createRubric(
    request: RubricRequestBody,
  ): Promise<CreateRubricResponse> {
    return fetchAPI<CreateRubricResponse>(
      `/courses/${request.course_id}/rubrics`,
      {
        method: "POST",
        body: JSON.stringify(request.data),
      },
    );
  },

  /**
   * Get a rubric by its ID.
   * @param request - The request object containing rubric ID and type (course).
   * @returns A promise that resolves to the retrieved rubric response.
   */
  async getRubric(request: RubricRequestBody): Promise<Rubric> {
    return toPaletteFormat(
      await fetchAPI<CanvasRubric>(
        `/courses/${request.course_id}/rubrics/${request.rubric_id}`,
      ),
    );
  },

  /**
   * Update an existing rubric in a specific course.
   *
   * @returns A promise that resolves to the updated rubric response.
   */
  async updateRubric(
    request: RubricRequestBody,
  ): Promise<UpdateRubricResponse> {
    return fetchAPI<UpdateRubricResponse>(
      `/courses/${request.course_id}/rubrics/${request.rubric_id}`,
      {
        method: "PUT",
        body: JSON.stringify(request.data),
      },
    );
  },

  /**
   * Delete a rubric by its ID.
   * @param request - The request object containing rubric ID and course ID.
   * @returns A promise that resolves to the deleted rubric response.
   */
  async deleteRubric(
    request: RubricRequestBody,
  ): Promise<DeleteRubricResponse> {
    return fetchAPI<DeleteRubricResponse>(
      `/courses/${request.course_id}/rubrics/${request.rubric_id}`,
      {
        method: "DELETE",
      },
    );
  },

  /**
   * Get all rubrics in a specific course.
   * @param {PartialRubricRequest} request - The request object containing course ID.
   * @returns {Promise<Rubric[]>} A promise that resolves to the retrieved rubrics response.
   */
  async getAllRubrics(request: RubricRequestBody): Promise<Rubric[]> {
    const canvasRubrics: CanvasRubric[] = await fetchAPI<CanvasRubric[]>(
      `/courses/${request.course_id}/rubrics?per_page=100`,
    );

    // Check if the response is an array
    if (!Array.isArray(canvasRubrics)) {
      throw new Error(
        "Unexpected response format: Expected an array of rubrics.",
      );
    }

    return canvasRubrics.map((rubric) => {
      return toPaletteFormat(rubric);
    });
  },
};
