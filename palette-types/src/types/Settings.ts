/**
 * Type definition for user settings
 */

export interface Settings {
  userName: string;
  token: string;
  preferences: {
    darkMode: boolean;
    defaultScale: number;
  };
}
