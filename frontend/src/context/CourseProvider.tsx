import { createContext, ReactNode, useContext, useState } from "react";
import { Course } from "palette-types";

interface CourseProviderProps {
  activeCourse: Course | null;
  setActiveCourse: (activeCourse: Course | null) => void;
}

const CourseContext = createContext<CourseProviderProps>({
  activeCourse: null,
  setActiveCourse: () => {},
});

export const useCourse = () => useContext(CourseContext);

export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const [activeCourse, setActiveCourseState] = useState<Course | null>(() => {
    const stored = sessionStorage.getItem("activeCourse");
    return stored ? (JSON.parse(stored) as Course) : null;
  });

  // wrapper for setter to persist active course in local storage
  const setActiveCourse = (course: Course | null) => {
    if (course) {
      sessionStorage.setItem("activeCourse", JSON.stringify(course));
    } else {
      sessionStorage.removeItem("activeCourse");
    }

    setActiveCourseState(course);
  };

  return (
    <CourseContext.Provider value={{ activeCourse, setActiveCourse }}>
      {children}
    </CourseContext.Provider>
  );
};
