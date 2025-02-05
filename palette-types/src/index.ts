/**
 * Barrel file for type definitions. Allows easy importing from a single 'palette-types' alias without any messy config.
 */

// Export everything from canvasProtocol
export * from "./canvasProtocol/canvasRubricResponses";
export * from "./canvasProtocol/canvasRubricRequests";

// Export everything from canvasTypes
export * from "./canvasTypes/CanvasAssessment";
export * from "./canvasTypes/CanvasAssociation";
export * from "./canvasTypes/CanvasCriterion";
export * from "./canvasTypes/CanvasRating";
export * from "./canvasTypes/CanvasRubric";
export * from "./canvasTypes/RubricObjectHash";
export * from "./canvasTypes/CanvasCourse";
export * from "./canvasTypes/CanvasAssignment";
export * from "./canvasTypes/CanvasGradedSubmission";

// Export everything from protocol
export * from "./protocol/PaletteAPIErrorData";
export * from "./protocol/PaletteAPIRequest";
export * from "./protocol/PaletteAPIResponse";

// Export everything from types
export * from "./types/Criteria";
export * from "./types/Rating";
export * from "./types/Rubric";
export * from "./types/Course";
export * from "./types/Template";
export * from "./types/Assignment";
export * from "./types/Submission";
export * from "./types/Settings";
export * from "./types/GroupedSubmissions";
