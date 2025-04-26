import { createContext, ReactNode, useContext, useState } from "react";
import { Assignment } from "palette-types";

interface AssignmentProviderProps {
  activeAssignment: Assignment | null;
  setActiveAssignment: (activeCourse: Assignment | null) => void;
}

const AssignmentContext = createContext<AssignmentProviderProps>({
  activeAssignment: null,
  setActiveAssignment: () => {},
});

export const useAssignment = () => useContext(AssignmentContext);

export const AssignmentProvider = ({ children }: { children: ReactNode }) => {
  const [activeAssignment, setActiveAssignmentState] =
    useState<Assignment | null>(() => {
      const stored = sessionStorage.getItem("activeAssignment");
      return stored ? (JSON.parse(stored) as Assignment) : null;
    });

  const setActiveAssignment = (assignment: Assignment | null) => {
    if (assignment) {
      sessionStorage.setItem("activeAssignment", JSON.stringify(assignment));
    } else {
      sessionStorage.removeItem("activeAssignment");
    }
    setActiveAssignmentState(assignment);
  };

  return (
    <AssignmentContext.Provider
      value={{
        activeAssignment: activeAssignment,
        setActiveAssignment: setActiveAssignment,
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
};
