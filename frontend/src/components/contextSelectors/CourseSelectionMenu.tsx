/**
 * Course Selection component.
 *
 * When the user selects the grading view, this component will display the results of the request to show courses
 * they are authorized to grade.
 */
import { MouseEvent, ReactElement, useEffect, useState } from "react";
import { useFetch } from "@hooks";
import { Course, PaletteAPIResponse } from "palette-types";
import { useCourse } from "../../context/CourseProvider.tsx";
import { PaletteActionButton } from "../buttons/PaletteActionButton.tsx";
import { LoadingDots } from "../LoadingDots.tsx";

export function CourseSelectionMenu({
  onSelect,
}: {
  onSelect: (open: boolean) => void;
}): ReactElement {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { fetchData: getCourses } = useFetch("/courses");
  const { setActiveCourse } = useCourse();

  const [filter, setFilter] = useState<{
    label: string;
    value: string;
    options?: string[];
  }>({ label: "All", value: "all", options: ["all"] });

  const filterOptions = [
    { label: "All", value: "all", options: ["all"] },
    {
      label: "Quantity",
      value: "quantity",
      options: ["all", "current", "past"],
    },
    {
      label: "Course Format",
      value: "course_format",
      options: ["online", "on_campus", "blended"],
    },
    {
      label: "State",
      value: "course_state",
      options: ["unpublished", "available", "completed", "deleted"],
    },
    {
      label: "Enrollment State",
      value: "enrollment_state",
      options: ["active", "invited", "inactive"],
    },
    {
      label: "Term",
      value: "term",
      options: ["all", "current", "past"],
    },
    {
      label: "Course Code",
      value: "course_code",
      options: ["CS", "CSE", "CSC", "SER", "EEE"],
    },
  ];

  /**
   * Run fetchCourses when component initially mounts.
   */
  useEffect(() => {
    void fetchCourses();
  }, []);

  /**
   * Get all courses the user is authorized to grade.
   */
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = (await getCourses()) as PaletteAPIResponse<Course[]>; // Trigger the GET request

      if (response.success) {
        setCourses(response.data!);
      } else {
        setErrorMessage(response.error || "Failed to get courses");
      }
    } catch (error) {
      console.error(
        "An unexpected error occurred while getting courses: ",
        error,
      );
      setErrorMessage("An unexpected error occurred while fetching courses.");
    }
    setLoading(false);
  };

  /**
   * Render courses on the ui for user to select from.
   */
  const renderCourses = () => {
    return (
      <div>
        {courses.map((course: Course) => (
          <div
            key={course.id}
            className={
              "flex gap-4 bg-gray-600 hover:bg-gray-500 px-3 py-1 cursor-pointer rounded-full font-bold text-lg"
            }
            onClick={() => handleCourseSelection(course)}
          >
            <h3>{course.name}</h3>
          </div>
        ))}
      </div>
    );
  };

  const renderFilters = () => {
    return (
      <div className="">
        <span className="text-lg font-bold mb-2 mr-2">Filter by:</span>
        {filterOptions.map((option) => (
          <button
            key={option.value}
            className={`${filter.value === option.value ? "border-2 border-blue-500" : ""} bg-gray-600 hover:bg-gray-500 px-3 py-1 cursor-pointer rounded-full font-bold text-lg mr-2 `}
            onClick={() => setFilter(option)}
          >
            <span className="text-white">{option.label}</span>
          </button>
        ))}
      </div>
    );
  };

  const renderFilterOptions = () => {
    return (
      <div className="flex flex-col gap-2">
        {filter.options?.map((option) => <p key={option}>{option}</p>)}
      </div>
    );
  };
  const renderContent = () => {
    if (loading) return <LoadingDots />;
    if (errorMessage)
      return <p className="text-red-500 font-normal">Error: {errorMessage}</p>;
    if (courses.length === 0) return <div>No courses available to display</div>;

    return (
      <div
        className={
          "grid gap-2 my-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
        }
      >
        {renderFilters()}
        {filter && renderFilterOptions()}
      </div>
    );
  };

  const handleCourseSelection = (course: Course) => {
    setActiveCourse(course);
    onSelect(false);
  };

  /**
   * Wrapper for fetchCourses when triggered by a click event on the refresh button.
   * @param event - user clicks the "refresh" button
   */
  const handleGetCourses = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    void fetchCourses();
  };
  return (
    <div className={"grid gap-2 text-2xl"}>
      <div>{renderContent()}</div>
      <div className={"justify-self-end"}>
        <PaletteActionButton
          color={"BLUE"}
          title={"Refresh"}
          onClick={handleGetCourses}
          autoFocus={true}
        />
      </div>
    </div>
  );
}
