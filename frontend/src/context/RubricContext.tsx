/**
 * Future use
 */
import { Rubric } from "palette-types";
import { createContext, ReactNode, useContext, useState } from "react";

type RubricProviderProps = {
  activeRubric: Rubric | null;
  setActiveRubric: (activeRubric: Rubric | null) => void;
};

const RubricContext = createContext<RubricProviderProps>({
  activeRubric: null,
  setActiveRubric: () => {},
});

export const useRubric = () => useContext(RubricContext);

export const RubricProvider = ({ children }: { children: ReactNode }) => {
  const [activeRubric, setActiveRubric] = useState<Rubric | null>(null);

  return (
    <RubricContext.Provider value={{ activeRubric, setActiveRubric }}>
      {children}
    </RubricContext.Provider>
  );
};
