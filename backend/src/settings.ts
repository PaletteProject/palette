import { Settings } from "palette-types";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// the settings path
const SETTINGS_PATH = "./settings.json";

export const defaultSettings: Settings = {
  userName: "admin",
  token: "default token",
  templateCriteria: [],
  preferences: {
    defaultRatings: {
      maxDefaultPoints: 5,
      maxDefaultDescription: "Well done!",
      minDefaultPoints: 0,
      minDefaultDescription: "Not included",
    },
    darkMode: false,
    defaultScale: 1,
  },
  course_filters: [],
  course_filter_presets: [],
  assignment_filters: [],
  assignment_filter_presets: [],
} as const;

// the settings object
let settings: Settings | null = null;

/**
 * The settings API defines the interface for the singleton settings object. It provides
 * utility functions for working with the settings object, such as getting and
 * updating the settings object.
 */
export const SettingsAPI = {
  /**
   * Get the settings object. If `includeSensitiveFields` is true, the sensitive fields
   * will be included. DO NOT use this option when communicating the settings object to the client.
   *
   * @param includeSensitiveFields Whether to include sensitive fields (like the Canvas API token) in the settings object.
   * @returns The settings object.
   */
  getUserSettings(includeSensitiveFields: boolean = false): Settings {
    // lazy load the settings object
    if (settings === null) {
      initializeSettings();
    }

    // mask out sensitive fields, if requested
    if (!includeSensitiveFields) {
      // get the old token
      return {
        ...settings,
        token: settings!.token,
      } as Settings;
    }

    return settings as Settings;
  },

  /**
   * Update the settings object and performs a settings file write. `newSettings` can be any subset of the settings object.
   *
   * Example usage: to update only the `token` field, pass `{ token: "new token" }`. To update only the `darkMode` preference,
   * pass `{ preferences: { darkMode: false } }`. That way, you don't have to pass the entire settings object
   * every time you want to update a single field.
   *
   * @param newSettings The subset of the settings object to update
   */
  updateUserSettings(newSettings: Partial<Settings>): void {
    if (settings === null) {
      initializeSettings();
    }

    // Update the settings object and write it to the settings file
    settings = mergeSettings({
      ...settings,
      ...newSettings,
    });
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
  },

  updateUserCourseFilters(
    courseFilters: { id: string; option: string; param_code: string }[],
  ): void {
    if (settings === null) {
      initializeSettings();
    }

    // Update the course filters in the settings object
    settings!.course_filters = courseFilters;

    // Write the updated settings object to the settings file
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
  },

  updateUserCourseFilterPresets(
    presets: {
      name: string;
      filters: { option: string; param_code: string }[];
    }[],
  ): void {
    if (settings === null) {
      initializeSettings();
    }

    // Update the course filter presets in the settings object
    settings!.course_filter_presets = presets.map((preset) => ({
      ...preset,
      id: uuidv4(),
    }));

    // Write the updated settings object to the settings file
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
  },

  updateUserAssignmentFilters(
    assignmentFilters: { id: string; option: string; param_code: string }[],
  ): void {
    if (settings === null) {
      initializeSettings();
    }

    // Update the assignment filters in the settings object
    settings!.assignment_filters = assignmentFilters;

    // Write the updated settings object to the settings file
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
  },

  updateUserAssignmentFilterPresets(
    presets: {
      name: string;
      id: string;
      filters: { option: string; param_code: string }[];
    }[],
  ): void {
    if (settings === null) {
      initializeSettings();
    }

    // Update the assignment filter presets in the settings object
    settings!.assignment_filter_presets = presets.map((preset) => ({
      ...preset,
    }));

    // Write the updated settings object to the settings file
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
  },
};

/**
 * Helper function to initialize the settings object by reading the settings file. If the settings file
 * does not exist, create it with the default user settings.
 */
function initializeSettings() {
  if (!fs.existsSync(SETTINGS_PATH)) {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(defaultSettings, null, 2));
    settings = defaultSettings;
  } else {
    try {
      const loadedSettings = JSON.parse(
        fs.readFileSync(SETTINGS_PATH, "utf-8"),
      ) as Partial<Settings>;
      // Fill in any missing fields with default values
      settings = mergeSettings(loadedSettings);
      // Save the merged settings back to the file
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
    } catch (error) {
      console.error("Error parsing settings.json", error);
      // revert to default settings
      settings = defaultSettings;
      // Save the merged settings back to the file
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(defaultSettings, null, 2));
    }
  }
}

/**
 * Helper function to fill in any missing settings fields with default values.
 */
function mergeSettings(target: Partial<Settings>): Settings {
  return {
    userName: target.userName ?? defaultSettings.userName,
    token: target.token ?? defaultSettings.token,
    templateCriteria:
      target.templateCriteria ?? defaultSettings.templateCriteria,
    preferences: {
      defaultRatings:
        target.preferences?.defaultRatings ??
        defaultSettings.preferences.defaultRatings,
      darkMode:
        target.preferences?.darkMode ?? defaultSettings.preferences.darkMode,
      defaultScale:
        target.preferences?.defaultScale ??
        defaultSettings.preferences.defaultScale,
    },
    course_filters: target.course_filters ?? defaultSettings.course_filters,
    course_filter_presets:
      target.course_filter_presets ?? defaultSettings.course_filter_presets,
    assignment_filters:
      target.assignment_filters ?? defaultSettings.assignment_filters,
    assignment_filter_presets:
      target.assignment_filter_presets ??
      defaultSettings.assignment_filter_presets,
  };
}

/**
 * Return a new, obfuscated token. Does not modify the original token.
 * @param {string} token - The token to obfuscate.
 * @returns {string} - The obfuscated token.
 */
export function obfuscateToken(token: string): string {
  if (!token) {
    return "";
  }
  const charsToDisplay = 5;
  if (charsToDisplay >= token.length) {
    // programmer error, but let's handle it gracefully
    return "*".repeat(token.length);
  }
  const visiblePart = token.slice(-charsToDisplay); // last N chars onwards
  const hiddenPart = "*".repeat(token.length - charsToDisplay);
  return `${hiddenPart}${visiblePart}`;
}
