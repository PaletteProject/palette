/**
 * Canvas Course object represents a Course within the canvasAPI.
 *
 * This type is simplified from the Canvas API documentation to include only what we'll need in the program. Will
 * likely be trimmed down even more.
 *
 * Docs: https://canvas.instructure.com/doc/api/courses.html
 */

export interface CanvasCourse {
  id: number;
  name: string;
  account_id: number;
  uuid: string;
  start_at: string;
  grading_standard_id?: number;
  is_public: boolean;
  created_at: string;
  course_code: string;
  default_view: "feed" | "wiki" | "modules" | "assignments" | "syllabus";
  root_account_id: number;
  enrollment_term_id: number;
  license?: string;
  grade_passback_setting?: string | null;
  end_at?: string | null;
  public_syllabus: boolean;
  public_syllabus_to_auth: boolean;
  storage_quota_mb: number;
  is_public_to_auth_users: boolean;
  homeroom_course?: boolean;
  course_color?: string | null;
  friendly_name?: string | null;
  apply_assignment_group_weights: boolean;
  calendar?: {
    ics: string;
  };
  time_zone?: string;
  blueprint: boolean;
  template: boolean;
  sis_course_id?: string;
  integration_id?: string | null;
  enrollments: {
    type: "student" | "teacher" | "ta" | "observer" | "designer";
    role: string;
    role_id: number;
    user_id: number;
    enrollment_state: "active" | "invited" | "inactive";
    limit_privileges_to_course_section?: boolean;
  }[];
  hide_final_grades: boolean;
  workflow_state: "unpublished" | "available" | "completed" | "deleted";
  course_format: "online" | "on_campus" | "blended";
  restrict_enrollments_to_course_dates: boolean;
}
