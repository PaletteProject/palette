/**
 * Defines an Assignment object within the Palette context.
 */

export interface Assignment {
  id: number;
  name: string;
  description: string;
  dueDate: string;
  createdAt: string;
  pointsPossible: number;
  rubricId: number | undefined; // associated rubric
  visibility: string;
  all_dates: string;
  published: boolean;
  moduleName: string;
  lockInfo: {
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
}
