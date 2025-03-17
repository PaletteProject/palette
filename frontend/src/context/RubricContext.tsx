import { Rubric } from "palette-types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useCourse } from "./CourseProvider.tsx";
import { useAssignment } from "./AssignmentProvider.tsx";
import { createRubric } from "@utils";
import { getRubric } from "../service/rubricService.ts";

type RubricProviderProps = {
  activeRubric: Rubric;
  setActiveRubric: (activeRubric: Rubric) => void;
};

const RubricContext = createContext<RubricProviderProps>({
  activeRubric: createRubric(),
  setActiveRubric: () => {},
});

export const useRubric = () => {
  const context = useContext(RubricContext);
  if (!context) {
    throw new Error("useRubricBuilder must be used within a RubricProvider");
  }
  return context;
};

/**
 * Provides the context globally throughout the React application.
 */
export const RubricProvider = ({ children }: { children: ReactNode }) => {
  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();

  const [activeRubric, setActiveRubric] = useState<Rubric>(createRubric());

  useEffect(() => {
    if (!activeCourse || !activeAssignment) return;
    void getRubric(activeCourse, activeAssignment);
  }, [activeCourse?.id, activeAssignment?.rubricId]);

  return (
    <RubricContext.Provider value={{ activeRubric, setActiveRubric }}>
      {children}
    </RubricContext.Provider>
  );
};
