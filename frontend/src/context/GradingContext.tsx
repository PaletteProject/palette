import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import type { PaletteGradedSubmission } from "palette-types";

type GradingContextType = {
  gradedSubmissionCache: Record<number, PaletteGradedSubmission>;
  setGradedSubmissionCache: Dispatch<
    SetStateAction<Record<number, PaletteGradedSubmission>>
  >;
};

const GradingContext = createContext<GradingContextType | undefined>(undefined);

export const useGradingContext = () => {
  const context = useContext(GradingContext);
  if (!context) {
    throw new Error("useGradingContext must be used within a GradingProvider");
  }
  return context;
};

export const GradingProvider = ({ children }: { children: ReactNode }) => {
  const [gradedSubmissionCache, setGradedSubmissionCache] = useState<
    Record<number, PaletteGradedSubmission>
  >({});

  return (
    <GradingContext.Provider
      value={{
        gradedSubmissionCache,
        setGradedSubmissionCache,
      }}
    >
      {children}
    </GradingContext.Provider>
  );
};
