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
    if (loading) return <p>Loading...</p>;
    if (errorMessage)
      return <p className="text-red-500 font-normal">Error: {errorMessage}</p>;
    if (courses.length === 0) return <div>No courses available to display</div>;

    return (
      <div className={"grid gap-2 my-1"}>
        Select the course you'd like to grade:
        <div>
          {courses.map((course: Course) => (
            <div
              key={course.id}
              className={
                "flex gap-4 bg-gray-600 hover:bg-gray-500 px-3 py-1 cursor-pointer rounded-full font-bold"
              }
              onClick={() => handleCourseSelection(course)}
            >
              <h3>{course.name}</h3>
            </div>
          ))}
        </div>
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
      <div>{renderCourses()}</div>
      <button
        onClick={handleGetCourses}
        className={
          "justify-self-end bg-blue-500 px-2 py-1 rounded-full hover:opacity-80 active:opacity-70"
        }
      >
        Refresh
      </button>
    </div>
  );
}
