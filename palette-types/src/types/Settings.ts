/**
 * Type definition for user settings
 */

import { Template } from "./Template";

export interface Settings {
  userName: string;
  templates: Template[];
  token: string;
  preferences: {
    darkMode: boolean;
    defaultScale: number;
  };
}
