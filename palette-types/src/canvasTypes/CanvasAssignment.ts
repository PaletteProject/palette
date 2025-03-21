/**
 * Defines the Canvas Assignment object returned from the Canvas API.
 */

export interface CanvasAssignment {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  due_at?: string;
  lock_at?: string;
  unlock_at?: string;
  course_id: number;
  html_url: string;
  submission_types: string[];
  has_submitted_submissions: boolean;
  grading_type: string;
  points_possible: number;
  grading_standard_id?: number;
  published: boolean;
  unpublishable: boolean;
  only_visible_to_overrides: boolean;
  locked_for_user: boolean;
  lock_info?: {
    asset_string: string;
    unlock_at?: string;
    lock_at?: string;
    context_module?: {
      id: number;
      name: string;
      position: number;
      workflow_state: string;
      require_sequential_progress: boolean;
      prerequisites: unknown[];
      completion_requirements: unknown[];
    };
  };
  lock_explanation?: string;
  quiz_id?: number;
  anonymous_submissions: boolean;
  discussion_topic?: {
    id: number;
    title: string;
    message: string;
    html_url: string;
    posted_at: string;
    last_reply_at?: string;
    require_initial_post: boolean;
    user_can_see_posts: boolean;
    podcast_has_student_posts: boolean;
  };
  peer_reviews: boolean;
  automatic_peer_reviews: boolean;
  peer_review_count?: number;
  peer_reviews_assign_at?: string;
  intra_group_peer_reviews: boolean;
  group_category_id?: number;
  needs_grading_count: number;
  needs_grading_count_by_section?: {
    section_id: number;
    needs_grading_count: number;
  }[];
  position: number;
  post_to_sis: boolean;
  integration_id?: string;
  integration_data?: unknown;
  submission?: {
    id: number;
    assignment_id: number;
    user_id: number;
    submitted_at?: string;
    excused: boolean;
    late_policy_status: string;
    points_deducted?: number;
    grade_matches_current_submission: boolean;
  };
  use_rubric_for_grading: boolean;
  rubric_settings?: {
    id: number;
    title: string;
    points_possible: number;
    free_form_criterion_comments: boolean;
  };
  rubric?: {
    id: string;
    points: number;
    description: string;
    long_description: string;
    criterion_use_range: boolean;
    ratings: {
      id: string;
      points: number;
      description: string;
      long_description: string;
    }[];
  }[];
  allowed_extensions?: string[];
  external_tool_tag_attributes?: {
    url: string;
    new_tab: boolean;
    resource_link_id: string;
    content_id?: number;
  };
  turnitin_enabled: boolean;
  vericite_enabled: boolean;
  plagiarism_detection_platform?: string;
  group_assignment: boolean;
  allowed_attempts: number;
  annotatable_attachment_id?: number;
  annotatable_type?: string;
  submission_comments?: {
    author_id: number;
    author_name: string;
    comment: string;
    created_at: string;
  }[];
  assignment_visibility: string;
  all_dates: string;
}
