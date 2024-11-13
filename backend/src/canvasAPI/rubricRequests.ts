import {
  CanvasRubric,
  CreateRubricAssociationRequest,
  CreateRubricRequest,
  DeleteRubricRequest,
  GetAllRubricsRequest,
  GetRubricRequest,
  Rubric,
  RubricObjectHash,
  UpdateRubricRequest,
  UpdateRubricResponse,
} from "palette-types";
import { fetchAPI } from "../utils/fetchAPI.js";
import { toPaletteFormat } from "../utils/rubricUtils.js";
import {
  isCanvasRubric,
  isPaginatedRubricsList,
  isRubricObjectHash,
} from "../utils/typeGuards";

/**
 * API methods for interacting with Canvas Rubrics.
 */
export const RubricsAPI = {
  /**
   * Create a new rubric in a specific course.
   * @param request - The request object containing rubric details.
   * @param courseID - The ID of the course.
   * @returns A promise that resolves to the created rubric response.
   */
  async createRubric(
    request: CreateRubricRequest,
    courseID: number,
  ): Promise<Rubric> {
    // canvas api returns a rubric object hash
    const response: RubricObjectHash = await fetchAPI<RubricObjectHash>(
      `/courses/${courseID}/rubrics`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );

    // Check if the response is a RubricObjectHash
    if (!isRubricObjectHash(response)) {
      throw new Error(
        "Unexpected response format: Expected a RubricObjectHash.",
      );
    }

    // return the created rubric in the expected format
    return toPaletteFormat(response.rubric as CanvasRubric);
  },

  /**
   * Get a rubric by its ID.
   * @param request - The request object containing rubric ID and type (course).
   * @returns A promise that resolves to the retrieved rubric response.
   */
  async getRubric(request: GetRubricRequest): Promise<Rubric> {
    return toPaletteFormat(
      await fetchAPI<CanvasRubric>(
        `/courses/${request.course_id}/rubrics/${request.id}`,
      ),
    );
  },

  /**
   * Update an existing rubric in a specific course.
   * @param request - The request object containing updated rubric details.
   * @param courseID - The ID of the course.
   * @returns A promise that resolves to the updated rubric response.
   */
  async updateRubric(
    request: UpdateRubricRequest,
    courseID: number,
  ): Promise<UpdateRubricResponse> {
    return fetchAPI<UpdateRubricResponse>(
      `/courses/${courseID}/rubrics/${request.id}`,
      {
        method: "PUT",
        body: JSON.stringify(request),
      },
    );
  },

  /**
   * Delete a rubric by its ID (including all its associations).
   * @param request - The request object containing rubric ID and course ID.
   * @returns A promise that resolves to the deleted rubric response.
   */
  async deleteRubric(request: DeleteRubricRequest): Promise<Rubric> {
    // canvas api returns a CanvasRubric
    const response: CanvasRubric = await fetchAPI<CanvasRubric>(
      `/courses/${request.course_id}/rubrics/${request.id}`,
      {
        method: "DELETE",
      },
    );

    // Check if the response is a CanvasRubric
    if (!isCanvasRubric(response)) {
      throw new Error("Unexpected response format: Expected a CanvasRubric.");
    }

    // return the deleted rubric in the expected format
    return toPaletteFormat(response);
  },

  /**
   * Get all rubrics in a specific course.
   * @param {GetAllRubricsRequest} request - The request object containing course ID.
   * @returns {Promise<Rubric[]>} A promise that resolves to the retrieved rubrics response.
   */
  async getAllRubrics(request: GetAllRubricsRequest): Promise<Rubric[]> {
    const canvasRubrics: CanvasRubric[] = await fetchAPI<CanvasRubric[]>(
      `/courses/${request.courseID}/rubrics?per_page=100`,
    );

    // check if the response is an array of CanvasRubric
    if (!isPaginatedRubricsList(canvasRubrics)) {
      throw new Error(
        "Unexpected response format: Expected an array of CanvasRubric.",
      );
    }

    // return the rubrics in the expected format
    return canvasRubrics.map((rubric) => {
      return toPaletteFormat(rubric);
    });
  },

  /**
   * Create a new rubric association in a specific course. The association can be with a
   * specific assignment, or just the course itself.
   * @param request - The request object containing rubric association details.
   * @param courseID - The ID of the course.
   */
  async createRubricAssociation(
    request: CreateRubricAssociationRequest,
    courseID: number,
  ): Promise<Rubric> {
    // canvas api returns a RubricObjectHash (contrary to the documentation!)
    const response = await fetchAPI<RubricObjectHash>(
      `/courses/${courseID}/rubric_associations`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );

    // Check if the response is a RubricObjectHash
    if (!isRubricObjectHash(response)) {
      throw new Error(
        "Unexpected response format: Expected a RubricObjectHash.",
      );
    }

    // return the created rubric in the expected format
    return toPaletteFormat(response.rubric as CanvasRubric);
  },
};
