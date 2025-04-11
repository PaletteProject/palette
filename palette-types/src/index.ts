/**
 * Barrel file for type definitions. Allows easy importing from a single 'palette-types' alias without any messy config.
 */

// Export all types from the package
export * from "./types/Assignment";
export * from "./types/Course";
export * from "./types/Criteria";
export * from "./types/GroupedSubmissions";
export * from "./types/PaletteGradedSubmission";
export * from "./types/Rating";
export * from "./types/Rubric";
export * from "./types/Settings";
export * from "./types/Submission";
export * from "./types/SubmissionComment";
export * from "./types/Tag";
export * from "./types/Template";

// Export Canvas types
export * from "./canvasTypes/CanvasAssessment";
export * from "./canvasTypes/CanvasAssignment";
export * from "./canvasTypes/CanvasAssociation";
export * from "./canvasTypes/CanvasCourse";
export * from "./canvasTypes/CanvasCriterion";
export * from "./canvasTypes/CanvasGradedSubmission";
export * from "./canvasTypes/CanvasRating";
export * from "./canvasTypes/CanvasRubric";
export * from "./canvasTypes/RubricObjectHash";

// Export protocol types
export * from "./protocol/PaletteAPIErrorData";
export * from "./protocol/PaletteAPIRequest";
export * from "./protocol/PaletteAPIResponse";

// Export Canvas protocol types
export * from "./canvasProtocol/canvasRubricRequests";
export * from "./canvasProtocol/canvasRubricResponses";
