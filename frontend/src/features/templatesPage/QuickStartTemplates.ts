import { createTemplate } from "../../utils/templateFactory";
import { createCriterion, createRating } from "../../utils/rubricFactory";

// Template 1: Design Document

const clarityRatings = [
  createRating(
    10,
    "Comprehensive and precise",
    "All requirements are clearly defined, including functional and non-functional aspects.",
  ),
  createRating(
    5,
    "Somewhat clear",
    "Requirements are defined but lack detail or clarity in some areas.",
  ),

  createRating(
    0,
    "Unclear or missing",
    "Requirements are vague or missing key elements.",
  ),
];

const architectureRatings = [
  createRating(
    15,
    "Well-structured with diagrams",
    "System architecture is clearly outlined with appropriate diagrams and explanations.",
  ),
  createRating(
    7,
    "Partially structured",
    "Some aspects of the architecture are well-defined, but key details are missing.",
  ),
  createRating(
    0,
    "Unclear or missing",
    "No meaningful system architecture is provided.",
  ),
];

const scalabilityRatings = [
  createRating(
    10,
    "Fully considers scalability",
    "Addresses scalability concerns with detailed strategies for future growth.",
  ),
  createRating(
    5,
    "Somewhat considers scalability",
    "Mentions scalability but lacks concrete implementation details.",
  ),
  createRating(
    0,
    "No scalability considerations",
    "No mention of scalability or future growth.",
  ),
];

const clarityCriterion = createCriterion(
  "Clarity of Requirements",
  "Clearly defines system requirements and constraints.",
  clarityRatings,
  10,
  "",
  "Ensure requirements are well-defined and unambiguous.",
  "Requirements Clarity",
);

const architectureCriterion = createCriterion(
  "System Architecture",
  "Provides a well-structured system architecture.",
  architectureRatings,
  15,
  "",
  "Include an architecture diagram and component breakdown.",
  "System Architecture",
);

const scalabilityCriterion = createCriterion(
  "Scalability Considerations",
  "Considers scalability and future growth.",
  scalabilityRatings,
  10,
  "",
  "Mention how the design can scale with increased usage.",
  "Scalability",
);

export const designDocumentTemplate = createTemplate(
  "Design Document",
  [clarityCriterion, architectureCriterion, scalabilityCriterion],
  undefined,
  "Evaluates the quality and completeness of the software design document.",
  new Date(),
  "Never",

  0,
  [],
  35,
  true,
);

// Template 2: Unit Testing
const coverageRatings = [
  createRating(
    20,
    "Excellent coverage",
    "Tests cover all key functionalities and edge cases.",
  ),
  createRating(
    10,
    "Partial coverage",
    "Some critical functions are tested, but coverage is incomplete.",
  ),
  createRating(
    0,
    "Minimal or no coverage",
    "Tests do not adequately cover functionality.",
  ),
];

const readabilityRatings = [
  createRating(
    10,
    "Well-structured and clear",
    "Tests are easy to read, modular, and maintainable.",
  ),
  createRating(
    5,
    "Somewhat clear",
    "Tests are somewhat structured but lack readability or modularity.",
  ),
  createRating(
    0,
    "Unstructured",
    "Tests are disorganized or difficult to maintain.",
  ),
];

const automationRatings = [
  createRating(
    15,
    "Fully automated in CI/CD",
    "Tests run automatically with proper CI/CD integration.",
  ),
  createRating(
    7,
    "Partially automated",
    "Some tests are automated, but the process is inconsistent.",
  ),
  createRating(
    0,
    "No automation",
    "Tests are not integrated into any automation pipeline.",
  ),
];

const coverageCriterion = createCriterion(
  "Coverage",
  "Tests cover key functionalities and edge cases.",
  coverageRatings,
  20,
  "",
  "Ensure at least 80% code coverage with meaningful tests.",
  "Test Coverage",
);

const readabilityCriterion = createCriterion(
  "Readability & Maintainability",
  "Tests are well-structured and easy to read.",
  readabilityRatings,
  10,
  "",
  "Write clean, modular test cases with clear assertions.",
  "Test Readability",
);

const automationCriterion = createCriterion(
  "Automation & CI Integration",
  "Tests are automated and integrated into CI/CD pipeline.",
  automationRatings,
  15,
  "",
  "Ensure tests run in CI/CD and block builds on failure.",
  "CI Integration",
);

export const unitTestingTemplate = createTemplate(
  "Unit Testing",
  [coverageCriterion, readabilityCriterion, automationCriterion],
  undefined,
  "Assesses the effectiveness, readability, and automation of unit tests.",
  new Date(),

  "Never",
  0,
  [],
  45,
  true,
);

// Template 3: Code Review

const codeQualityRatings = [
  createRating(
    15,
    "Follows best practices",
    "Code is clean, efficient, and adheres to industry standards.",
  ),
  createRating(
    7,
    "Moderate adherence",
    "Some best practices are followed, but there are inconsistencies.",
  ),
  createRating(0, "Poor quality", "Code lacks structure and best practices."),
];

const bugIdentificationRatings = [
  createRating(
    15,
    "Thorough bug detection",
    "Identifies logical errors, edge cases, and potential security risks.",
  ),
  createRating(
    7,
    "Some bugs identified",
    "Finds some issues but misses key problems.",
  ),
  createRating(
    0,
    "Minimal bug identification",
    "Fails to catch important errors or security risks.",
  ),
];

const feedbackRatings = [
  createRating(
    10,
    "Detailed and constructive",
    "Feedback is specific, respectful, and offers clear improvement suggestions.",
  ),
  createRating(
    5,
    "Partially constructive",
    "Feedback is given but lacks depth or clarity.",
  ),
  createRating(
    0,
    "Unhelpful feedback",
    "Feedback is vague, unconstructive, or missing.",
  ),
];

const codeQualityCriterion = createCriterion(
  "Code Quality & Best Practices",
  "Code follows best practices and clean coding standards.",
  codeQualityRatings,
  15,
  "",
  "Ensure clean, well-structured, and efficient code.",
  "Code Quality",
);

const bugIdentificationCriterion = createCriterion(
  "Bug Identification",
  "Identifies logic errors and security vulnerabilities.",
  bugIdentificationRatings,
  15,
  "",
  "Identify and report potential logical or security issues.",
  "Bug Detection",
);

const feedbackCriterion = createCriterion(
  "Constructive Feedback",
  "Feedback is clear, actionable, and constructive.",
  feedbackRatings,
  10,
  "",
  "Provide clear, respectful, and actionable feedback.",
  "Review Feedback",
);

export const codeReviewTemplate = createTemplate(
  "Code Review",
  [codeQualityCriterion, bugIdentificationCriterion, feedbackCriterion],
  undefined,
  "Evaluates the quality of code, bug identification, and review feedback.",
  new Date(),
  "Never",

  0,
  [],
  40,
  true,
);

// Template 4: Sprint Retrospective
const teamReflectionRatings = [
  createRating(
    10,
    "Insightful reflection",
    "Team identifies successes and challenges with meaningful takeaways.",
  ),
  createRating(
    5,
    "Somewhat reflective",
    "Team reflects but lacks depth or actionable insights.",
  ),
  createRating(
    0,
    "No reflection",
    "No meaningful evaluation of team performance.",
  ),
];

const improvementPlanRatings = [
  createRating(
    15,
    "Detailed improvement plan",
    "Identifies specific and achievable changes for the next sprint.",
  ),
  createRating(
    7,
    "Some improvement suggestions",
    "Has some plans for improvement but lacks specificity.",
  ),
  createRating(
    0,
    "No improvement plan",
    "Fails to suggest meaningful changes.",
  ),
];

const engagementRatings = [
  createRating(
    10,
    "Fully engaged team",
    "All team members actively participate and contribute.",
  ),
  createRating(
    5,
    "Partial participation",
    "Some team members engage, but others are passive.",
  ),
  createRating(
    0,
    "Minimal participation",
    "Few or no team members contribute meaningfully.",
  ),
];

const teamReflectionCriterion = createCriterion(
  "Reflection on Team Performance",
  "Evaluates what went well and what didn’t.",
  teamReflectionRatings,
  10,
  "",
  "Highlight achievements and areas needing improvement.",
  "Team Reflection",
);

const improvementPlanCriterion = createCriterion(
  "Actionable Improvement Plan",
  "Creates an actionable plan for the next sprint.",
  improvementPlanRatings,
  15,
  "",
  "Suggest concrete steps to enhance the workflow.",
  "Improvement Plan",
);

const engagementCriterion = createCriterion(
  "Engagement & Participation",
  "All team members actively contribute.",
  engagementRatings,
  10,
  "",
  "Ensure everyone contributes to the discussion.",
  "Team Engagement",
);

export const sprintRetrospectiveTemplate = createTemplate(
  "Sprint Retrospective",
  [teamReflectionCriterion, improvementPlanCriterion, engagementCriterion],
  undefined,
  "Assesses team reflections, improvement planning, and engagement in retrospectives.",
  new Date(),

  "Never",
  0,
  [],
  35,
  true,
);

// Template 5: Sprint Planning

const sprintGoalRatings = [
  createRating(
    10,
    "Well-defined and achievable",
    "Goals are clear, specific, and align with product needs.",
  ),
  createRating(
    5,
    "Partially defined",
    "Goals are somewhat clear but lack specificity or feasibility.",
  ),
  createRating(0, "Unclear or missing", "Sprint lacks defined goals."),
];

const taskBreakdownRatings = [
  createRating(
    15,
    "Tasks well-defined and estimated",
    "Work is broken down into manageable, properly estimated tasks.",
  ),
  createRating(
    7,
    "Somewhat structured",
    "Tasks are broken down but lack proper estimation.",
  ),
  createRating(
    0,
    "Poorly defined",
    "Tasks are not well-structured or estimated.",
  ),
];

const workloadRatings = [
  createRating(
    15,
    "Workload well-balanced",
    "Tasks are distributed fairly based on team capacity.",
  ),
  createRating(
    7,
    "Some imbalance",
    "Some team members are overburdened while others have little work.",
  ),
  createRating(0, "Poor distribution", "Workload is unevenly distributed."),
];

const sprintGoalCriterion = createCriterion(
  "Clear Sprint Goals",
  "Sprint goals are well-defined and achievable.",
  sprintGoalRatings,
  10,
  "",
  "Define clear and realistic sprint objectives.",
  "Sprint Goals",
);

const taskBreakdownCriterion = createCriterion(
  "Task Breakdown & Estimation",
  "Work is broken down into manageable tasks with accurate estimates.",
  taskBreakdownRatings,
  15,
  "",
  "Break work into tasks with estimated effort.",
  "Task Breakdown",
);

const workloadCriterion = createCriterion(
  "Team Capacity & Workload Balancing",
  "Workload is evenly distributed based on team capacity.",
  workloadRatings,
  15,
  "",
  "Ensure tasks are distributed fairly among team members.",
  "Workload Balancing",
);

export const sprintPlanningTemplate = createTemplate(
  "Sprint Planning",
  [sprintGoalCriterion, taskBreakdownCriterion, workloadCriterion],
  undefined,
  "Evaluates the clarity of sprint goals, task breakdown, and workload balancing.",
  new Date(),

  "Never",
  0,
  [],
  40,
  true,
);

export const quickStartTemplates = [
  designDocumentTemplate,
  unitTestingTemplate,
  codeReviewTemplate,
  sprintRetrospectiveTemplate,
  sprintPlanningTemplate,
];
