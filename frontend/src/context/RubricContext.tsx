import { PaletteAPIResponse, Rubric } from "palette-types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useFetch } from "@hooks";
import { useCourse } from "./CourseProvider.tsx";
import { useAssignment } from "./AssignmentProvider.tsx";
import { createRubric } from "@utils";

type RubricProviderProps = {
  activeRubric: Rubric;
  setActiveRubric: (activeRubric: Rubric) => void;
  getRubric: () => Promise<PaletteAPIResponse<Rubric>>;
};

const RubricContext = createContext<RubricProviderProps>({
  activeRubric: createRubric(),
  setActiveRubric: () => {},
  getRubric: () =>
    Promise.resolve({ data: createRubric() } as PaletteAPIResponse<Rubric>),
});

export const useRubric = () => {
  const context = useContext(RubricContext);
  if (!context) {
    throw new Error("useRubric must be used within a RubricProvider");
  }
  return context;
};

/**
 * Provides the context globally throughout the React application.
 */
export const RubricProvider = ({ children }: { children: ReactNode }) => {
  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();

  const { fetchData: getRubric } = useFetch<Rubric>(
    `/courses/${activeCourse?.id}/rubrics/${activeAssignment?.rubricId}`,
  );

  const [activeRubric, setActiveRubric] = useState<Rubric>(createRubric());

  useEffect(() => {
    const fetchRubric = async () => {
      if (!activeCourse?.id || !activeAssignment?.rubricId) return;

      try {
        const response = await getRubric();
        setActiveRubric((response.data as Rubric) ?? createRubric());
      } catch (error) {
        console.error("Failed to fetch rubric:", error);
        setActiveRubric(createRubric());
      }
    };

    void fetchRubric();
  }, [activeCourse?.id, activeAssignment?.rubricId]); // Dependency array updated

  return (
    <RubricContext.Provider
      value={{ activeRubric, setActiveRubric, getRubric }}
    >
      {children}
    </RubricContext.Provider>
  );
};
