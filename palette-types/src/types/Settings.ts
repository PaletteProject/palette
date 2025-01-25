/**
 * Type definition for user settings
 */

import { Template } from "./Template";

export interface Settings {
  userName: string;
  token: string;
  preferences: {
    darkMode: boolean;
    defaultScale: number;
  };
}
