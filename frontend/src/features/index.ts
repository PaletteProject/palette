/**
 * Barrel file for feature-specific components for concise imports with TS Path Aliases.
 */

// grading exports
export * from "./grading/gradingDashboard/AssignmentData.tsx";
export * from "./grading/GradingMain";
export * from "./grading/gradingDashboard/GroupSubmissions.tsx";
export * from "./grading/gradingDashboard/IndividualSubmission.tsx";
export * from "./grading/gradingDashboard/ProgressBar.tsx";
export * from "./grading/gradingDashboard/StatusIcons.tsx";
export * from "./grading/gradingDashboard/SubmissionsDashboard.tsx";

// rubric builder exports
export * from "./rubricBuilder/CriteriaInput";
export * from "./rubricBuilder/CSVExport";
export * from "./rubricBuilder/CSVImport.tsx";
export * from "./rubricBuilder/RatingInput";
export * from "./rubricBuilder/RubricBuilderMain";

// home exports
export * from "./home/Home";

// settings exports
export * from "./settings/SettingsMain";

// user exports
export * from "./user/UserClusters";
export * from "./user/UserRubrics";

export * from "./errorPages/NotFoundPage";
