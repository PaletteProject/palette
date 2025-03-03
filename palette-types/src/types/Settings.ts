/**
 * Type definition for user settings
 */
import { Template } from "./Template";

export interface Settings {
  userName: string;
  templateCriteria: Template[];
  token: string;
  preferences: {
    darkMode: boolean;
    defaultScale: number;
  };
  course_filters?: {
    option: string;
    param_code: string;
  }[];
}
