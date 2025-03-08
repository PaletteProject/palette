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
};

const SettingsContext = createContext<SettingsContextProps>({
  settings: DEFAULT_SETTINGS,
  setSettings: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { fetchData: getSettings } = useFetch("/user/settings");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

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
          throw new Error("Failed to fetch settings");
        }
      } catch (error) {
        console.error(error);
        setSettings(DEFAULT_SETTINGS);
      }
    };

    void fetchSettings();
  }, []);
  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
