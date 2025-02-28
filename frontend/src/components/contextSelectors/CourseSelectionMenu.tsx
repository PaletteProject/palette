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
import { PaletteTrash } from "../buttons/PaletteTrash.tsx";
import { LoadingDots } from "../LoadingDots.tsx";

export function CourseSelectionMenu({
  onSelect,
}: {
  onSelect: (open: boolean) => void;
}): ReactElement {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isTableVisible, setIsTableVisible] = useState<boolean>(true);
  const [optionChecked, setOptionChecked] = useState<boolean>(false);
  const { fetchData: getCourses } = useFetch("/courses");
  const { setActiveCourse } = useCourse();
  const [stagedFilters, setStagedFilters] = useState<
    {
      label: string;
      value: string;
      options?: string[];
      selected_option?: string;
    }[]
  >([]);

  const currentYear = new Date().getFullYear();

  const preDefinedFilters = [
    {
      label: "Course Format",
      value: "course_format",
      options: ["online", "on_campus", "blended"],
      selected_option: "",
    },
    {
      label: "State",
      value: "course_state",
      options: ["unpublished", "available", "completed", "deleted"],
      selected_option: "",
    },

    {
      label: "Term",
      value: "term",
      options: [
        currentYear.toString(),
        (currentYear - 1).toString(),
        (currentYear - 2).toString(),
        (currentYear - 3).toString(),
      ],
      selected_option: "",
    },
    {
      label: "Course Code",
      value: "course_code",
      options: ["CS", "CSE", "CSC", "SER", "EEE"],
      selected_option: "",
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
        error
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

  const updateStagedFilters = (
    filter: {
      label: string;
      value: string;
      options?: string[];
      selected_option?: string;
    },
    option: string
  ) => {
    const filterIndex = stagedFilters.findIndex(
      (stagedFilter) => stagedFilter.value === filter.value
    );
    const stagedFilter = stagedFilters[filterIndex];

    // Create a new staged filter object to avoid mutation
    const updatedStagedFilter = {
      label: filter.label,
      value: filter.value,
      options: filter.options,
      selected_option: option,
    };

    let newStagedFilters = [...stagedFilters];

    // Return a new array with the updated staged filter
    if (filterIndex === -1) {
      // If the filter is not in the array, add it
      newStagedFilters = [...stagedFilters, updatedStagedFilter];
      console.log("newStagedFilters:", newStagedFilters);
      setStagedFilters(newStagedFilters);
    } else {
      if (stagedFilter.selected_option === option) {
        setOptionChecked(false);
      }
      // If the filter is already in the array, update it
      newStagedFilters = [
        ...stagedFilters.slice(0, filterIndex),
        updatedStagedFilter,
        ...stagedFilters.slice(filterIndex + 1),
      ];
      setOptionChecked(true);
      console.log("debug:");
    }

    setStagedFilters(newStagedFilters);
  };

  const renderFiltersTable = () => {
    return (
      <div className="flex flex-col gap-2">
        <button
          className="text-lg font-bold mb-2"
          onClick={() => setIsTableVisible((prev) => !prev)}
        >
          {isTableVisible ? "Hide Filters" : "Show Filters"}
        </button>
        {
          <table className="border-2 border-gray-500 rounded-lg text-sm">
            <thead className="bg-gray-600 border-2 border-gray-500">
              <tr>
                {/* Filter Labels */}
                {preDefinedFilters.map((filter) => (
                  <th key={filter.value} className="border-2 border-gray-500">
                    {filter.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="flex-col items-start justify-start">
                {/* Filter Options */}
                {preDefinedFilters.map((filter) => (
                  <td key={filter.value} className="border-2 border-gray-500">
                    {filter.options?.map((option) => (
                      <div key={option} className="flex ">
                        <input
                          type="radio"
                          id={option}
                          checked={stagedFilters.some(
                            (stagedFilter) =>
                              stagedFilter.selected_option === option
                          )}
                          onChange={() => {
                            console.log("changed");
                          }}
                          className="mr-2"
                          onClick={() => {
                            updateStagedFilters(filter, option);
                          }}
                        />
                        <label htmlFor={option}>
                          {option.toUpperCase().replace("_", " ")}
                        </label>
                      </div>
                    ))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        }
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
        {renderFiltersTable()}
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

  const handleApplyFilters = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    setStagedFilters([]);
    console.log("applied filters");
  };

  return (
    <div className={"grid gap-2 text-2xl"}>
      <div>{renderContent()}</div>
      <div className={"justify-self-end flex gap-2 items-center"}>
        {stagedFilters.length > 0 && (
          <>
            <PaletteTrash
              title={"Clear Filters"}
              onClick={() => setStagedFilters([])}
            />

            <PaletteActionButton
              color={"GREEN"}
              title={"Apply Filters"}
              onClick={handleApplyFilters}
              autoFocus={false}
            />
          </>
        )}
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
