import { isCanvasAPIErrorResponse } from "./typeGuards.js";
import { CanvasAPIError } from "palette-types";
import { CanvasAPIUnexpectedError } from "../errors/UnknownCanvasError.js";
import util from "util";
import { SettingsAPI } from "../settings.js";

const CanvasAPIConfig = {
  baseURL: "https://canvas.asu.edu/api/v1",
  headers: {
    // get the token from the environment variables
    Authorization: `Bearer ${SettingsAPI.getUserSettings(true).token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

/**
 * Helper function to refresh the API config and ensure it's using the latest token.
 */
const refreshToken = () => {
  console.log("REFRESHING TOKEN");
  CanvasAPIConfig.headers.Authorization = `Bearer ${SettingsAPI.getUserSettings(true).token}`;
};

/**
 * Generic fetch wrapper function to avoid similar fetch requests in each CRUD method.
 * @param endpoint - URL of the target endpoint: api/<endpoint>.
 * @param options - Modify request body for specific requests.
 * @returns A promise that resolves to the API response object.
 * @throws Error will throw an error if an unknown error response format is encountered.
 */
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}, // default options (none)
): Promise<T> {
  refreshToken();
  try {
    const url = `${CanvasAPIConfig.baseURL}${endpoint}`;
    const requestInit: RequestInit = {
      ...options,
      headers: {
        ...CanvasAPIConfig.headers,
        ...(options.headers || {}),
      } as HeadersInit,
    };

    // build a request object to pass to fetch, then make the request and log it
    const request = new Request(url, requestInit);
    const response = await fetch(request);

    // parse and log the JSON response
    const json = (await response.json()) as unknown; // who knows what Canvas will return...
    logCanvasAPIResponse(response, json, true);

    // handle errors
    if (!response.ok) {
      // check if the error response is a Canvas API error
      if (isCanvasAPIErrorResponse(json)) {
        // pass the first error to the error handling middleware
        const errorMsg = (
          (json as { errors: CanvasAPIError[] }).errors[0] as {
            message: string;
          }
        ).message;
        throw new Error(errorMsg);
      } else {
        throw new CanvasAPIUnexpectedError(
          "Canvas API returned an unexpected error response",
          json,
        );
      }
    }

    return json as T;
  } catch (error: unknown) {
    if (error instanceof CanvasAPIUnexpectedError) {
      error.logCause(); // log the unexpected error response
    } else if (error instanceof Error) {
      console.error(`Canvas API Error: ${error.message}`);
    }
    throw error; // rethrow the error for the caller to handle
  }
}

/**
 * Utility function to log API responses to the console.
 * @param response the response object
 * @param body the response body
 * @param verbose whether to log the full response object or just the status code
 */
function logCanvasAPIResponse<T>(
  response: Response,
  body: T,
  verbose: boolean = false,
) {
  if (verbose) {
    // log the whole response (up to 50 levels deep) for debugging
    console.log(
      "\nCanvas API Response:\n",
      util.inspect(response, { depth: 50, colors: true }),
    );
  } else {
    // log just the status code for debugging
    console.log(`\nCanvas API Response Status: ${response.status}`);
  }

  // log the response body (up to 50 levels deep) for debugging
  // only if there's a body
  if (body) {
    console.log(
      `Canvas API Response Body (parsed JSON):\n
    ${util.inspect(body, { depth: 50, colors: true })}`,
    );
  }
}
