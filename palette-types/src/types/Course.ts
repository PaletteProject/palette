/**
 * Defines a Course object within the Palette context.
 */

export interface Course {
  id: number; // REQUIRED: Canvas-assigned unique identifier for the course
  name: string; // Course name to display in the Palette app
  termId: number; // Identifier for the term to which the course belongs
  term: {
    id: number;
    name: string;
    start_at: string;
    end_at: string;
  };
  enrollments: Array<{
    type: "teacher" | "ta"; // Enrollment type filtered to include only teachers or TAs
    enrollmentState: "active"; // Ensures only active enrollments are included
  }>;
}
