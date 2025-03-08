/**
 * Settings Context and Context Provider for global access to the latest user settings.
 */
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { Settings } from "palette-types";
import { useFetch } from "@hooks";

const DEFAULT_SETTINGS: Settings = {
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
};

type SettingsContextProps = {
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings>>;
  error: string;
};

const SettingsContext = createContext<SettingsContextProps>({
  settings: DEFAULT_SETTINGS,
  setSettings: () => {},
  error: "",
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { fetchData: getSettings } = useFetch("/user/settings");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettings();
        if (response.success) {
          setSettings((prevSettings) => ({
            ...prevSettings,
            ...(response.data as Settings),
          }));
        } else {
          setError("Failed to fetch settings, loading defaults.");
          setSettings(DEFAULT_SETTINGS);
        }
      } catch (error) {
        console.error(error);
        setSettings(DEFAULT_SETTINGS);
      }
    };

    void fetchSettings();
  }, []);
  return (
    <SettingsContext.Provider value={{ settings, setSettings, error }}>
      {children}
    </SettingsContext.Provider>
  );
};
