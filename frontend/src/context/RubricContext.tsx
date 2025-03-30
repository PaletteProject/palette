import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { PaletteAPIResponse, Rubric } from "palette-types";
import { useFetch } from "@/hooks";
import { useCourse } from "./CourseProvider.tsx";
import { useAssignment } from "./AssignmentProvider.tsx";
import { useSettings } from "./SettingsContext.tsx";
import { createRubric } from "@/utils";

type RubricProviderProps = {
  activeRubric: Rubric;
  setActiveRubric: Dispatch<SetStateAction<Rubric>>;
  getRubric: () => Promise<PaletteAPIResponse<Rubric>>;
};

const RubricContext = createContext<RubricProviderProps | undefined>(undefined);

export const useRubric = () => {
  const context = useContext(RubricContext);
  if (!context) {
    throw new Error("useRubric must be used within a RubricProvider");
  }
  return context;
};

/**
 * Provides the rubric context globally.
 */
export const RubricProvider = ({ children }: { children: ReactNode }) => {
  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();
  const { settings } = useSettings();

  const { fetchData: getRubric } = useFetch<Rubric>(
    `/courses/${activeCourse?.id}/rubrics/${activeAssignment?.rubricId}`,
  );

  const [activeRubric, setActiveRubric] = useState<Rubric>(() =>
    createRubric(settings),
  );

  useEffect(() => {
    const fetchRubric = async () => {
      if (!activeCourse?.id || !activeAssignment?.rubricId) return;

      try {
        const response = await getRubric();
        setActiveRubric((response.data as Rubric) ?? createRubric(settings));
      } catch (error) {
        console.error("Failed to fetch rubric:", error);
        setActiveRubric(createRubric(settings));
      }
    };

    void fetchRubric();
  }, [activeCourse?.id, activeAssignment?.rubricId, settings]);

  return (
    <RubricContext.Provider
      value={{ activeRubric, setActiveRubric, getRubric }}
    >
      {children}
    </RubricContext.Provider>
  );
};
