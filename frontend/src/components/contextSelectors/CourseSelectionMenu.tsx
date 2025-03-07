/**
 * Course Selection component.
 *
 * When the user selects the grading view, this component will display the results of the request to show courses
 * they are authorized to grade.
 */
import { MouseEvent, ReactElement, useEffect, useState } from "react";
import { useFetch } from "@hooks";
import { Course, PaletteAPIResponse, Settings } from "palette-types";
import { useCourse } from "../../context/CourseProvider.tsx";
import { PaletteActionButton } from "../buttons/PaletteActionButton.tsx";
import { PaletteTrash } from "../buttons/PaletteTrash.tsx";
import { LoadingDots } from "../LoadingDots.tsx";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useChoiceDialog } from "@context";

import { v4 as uuidv4 } from "uuid";
import { ChoiceDialog } from "../modals/ChoiceDialog.tsx";
export function CourseSelectionMenu({
  onSelect,
}: {
  onSelect: (open: boolean) => void;
}): ReactElement {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [optionChecked, setOptionChecked] = useState<boolean>(false);
  const [coursesFetched, setCoursesFetched] = useState<boolean>(false);
  const [showFilterTable, setShowFilterTable] = useState<boolean>(true);
  const [settingsFetched, setSettingsFetched] = useState<boolean>(false);
  const [showPresetDeleteButtons, setShowPresetDeleteButtons] =
    useState<boolean>(false);
  const [deletedPreset, setDeletedPreset] = useState<boolean>(false);
  const [presetName, setPresetName] = useState<string>("");
  const { setActiveCourse } = useCourse();
  const { openDialog, closeDialog } = useChoiceDialog();
  const [selectedFilters, setSelectedFilters] = useState<
    { option: string; param_code: string }[]
  >([]);
  const [courseFilterPresets, setCourseFilterPresets] = useState<
    {
      id: string;
      name: string;
      filters: { option: string; param_code: string }[];
    }[]
  >([]);
  const [stagedFilters, setStagedFilters] = useState<
    {
      label: string;
      value: string;
      options?: string[];
      selected_option?: string;
      param_code?: string;
    }[]
  >([]);

  const { fetchData: getUserSettings } = useFetch("/user/settings");
  const { fetchData: getCourses } = useFetch("/courses");
  const { fetchData: updateUserCourseFilters } = useFetch(
    "/user/settings/course_filters",
    {
      method: "PUT",
      body: JSON.stringify(selectedFilters),
    },
  );

  const { fetchData: updateUserCourseFilterPresets } = useFetch(
    "/user/settings/course_filter_presets",
    {
      method: "PUT",
      body: JSON.stringify(courseFilterPresets),
    },
  );
  const currentYear = new Date().getFullYear();

  const preDefinedFilters = [
    {
      label: "Course Format",
      value: "course_format",
      options: ["online", "on_campus", "blended"],
      selected_option: "",
      param_code: "course_format",
    },
    {
      label: "State",
      value: "course_state",
      options: ["unpublished", "available", "completed", "deleted"],
      selected_option: "",
      param_code: "state[]",
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
      param_code: "start_at",
    },
    {
      label: "Course Code",
      value: "course_code",
      options: ["CS", "CSE", "CSC", "SER", "EEE"],
      selected_option: "",
      param_code: "course_code[]",
    },
  ];

  /**
   * Run fetchCourses when component initially mounts.
   */
  useEffect(() => {
    void fetchUserSettings();
    setSettingsFetched(true);
  }, []);

  useEffect(() => {
    if (selectedFilters.length > 0) {
      void updateUserCourseFilters();
      void fetchCourses();
      setCoursesFetched(true);
      setShowFilterTable(false);
    }
  }, [selectedFilters]);

  useEffect(() => {
    console.log("courseFilterPresets:", courseFilterPresets);
    console.log("deletedPreset:", deletedPreset);
    if (courseFilterPresets.length > 0 || deletedPreset) {
      void updateUserCourseFilterPresets();
    }
  }, [courseFilterPresets]);

  /**
   * Get all courses the user is authorized to grade.
   */
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = (await getCourses()) as PaletteAPIResponse<Course[]>; // Trigger the GET request

      if (response.success) {
        console.log("response.data:", response.data);
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

  const fetchUserSettings = async () => {
    const response = (await getUserSettings()) as PaletteAPIResponse<Settings>;
    if (response.success) {
      setCourseFilterPresets(response.data?.course_filter_presets ?? []);
    }
  };

  /**
   * Render courses on the ui for user to select from.
   */
  const renderCourses = () => {
    return (
      <div>
        <div className="flex flex-row gap-2 items-center">
          <h2 className="text-gray-400 mb-2">Courses</h2>
          {!showFilterTable && (
            <FontAwesomeIcon
              icon={faCog}
              className="cursor-pointer text-gray-400 text-md"
              onClick={() => setShowFilterTable(!showFilterTable)}
              title="Create Custom Filter"
            />
          )}
        </div>
        {courses.length === 0 && (
          <div className="text-gray-300 font-normal">
            No courses available to display
          </div>
        )}
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
      param_code?: string;
    },
    option: string,
  ) => {
    const filterIndex = stagedFilters.findIndex(
      (stagedFilter) => stagedFilter.value === filter.value,
    );
    const stagedFilter = stagedFilters[filterIndex];

    // Create a new staged filter object to avoid mutation
    const updatedStagedFilter = {
      label: filter.label,
      value: filter.value,
      options: filter.options,
      selected_option: option,
      param_code: filter.param_code,
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

  const renderPresetFilters = () => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2 items-center">
          <h2 className="text-gray-400 text-md">Saved Presets</h2>
          {courseFilterPresets.length > 0 && (
            <FontAwesomeIcon
              icon={faCog}
              className="cursor-pointer text-gray-400 text-md"
              onClick={() => {
                setShowPresetDeleteButtons(!showPresetDeleteButtons);
              }}
            />
          )}
        </div>
        <hr className="w-full border-gray-500" />
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800">
          {courseFilterPresets.length === 0 && (
            <div className="text-gray-300 font-normal">
              No saved presets available
            </div>
          )}
          {courseFilterPresets.map((preset) => (
            <div
              key={preset.name || "preset-" + Math.random()}
              className="flex flex-col items-center justify-between w-full"
            >
              <button
                onClick={() => {
                  setSelectedFilters(preset.filters);
                }}
                title={preset.name || "Untitled"}
                className="bg-gray-600 w-full hover:bg-gray-500 px-3 py-1 cursor-pointer rounded-full font-bold text-lg relative"
              >
                <div className="flex flex-row items-center w-full">
                  {showPresetDeleteButtons && (
                    <div className="ml-4 mt-1">
                      <PaletteTrash
                        title={"Delete Preset"}
                        onClick={() => {
                          setCourseFilterPresets(
                            courseFilterPresets.filter(
                              (p) => p.id !== preset.id,
                            ),
                          );
                          setDeletedPreset(true);
                        }}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-4 flex-1 mt-1">
                    {preDefinedFilters.map((preDefinedFilter) => {
                      const matchingFilter = preset.filters.find(
                        (f) => f.param_code === preDefinedFilter.param_code,
                      );
                      return (
                        <p
                          key={preDefinedFilter.value}
                          className={`text-center ${
                            matchingFilter?.option
                              ? "text-white"
                              : "text-gray-500"
                          }`}
                        >
                          {matchingFilter?.option ?? "N/A"}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFiltersTable = () => {
    return (
      <div className="flex flex-col gap-2 p-2">
        <h2 className="text-gray-400 text-md">Create Custom Filter</h2>
        <input
          type="text"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          placeholder="Enter Preset Name before 'Save Preset' (optional). Otherwise, just click 'Apply Filters' to fetch courses."
          className="bg-gray-600 hover:bg-gray-500 px-3 py-1 cursor-pointer rounded-lg font-bold text-sm"
        />
        {
          <table className="border-2 border-gray-500 rounded-lg text-sm w-full">
            <thead className="bg-gray-600 border-2 border-gray-500">
              <tr className="grid grid-cols-4">
                {/* Filter Labels */}
                {preDefinedFilters.map((filter) => (
                  <th key={filter.value} className="border-2 border-gray-500">
                    {filter.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="grid grid-cols-4">
                {/* Filter Options */}
                {preDefinedFilters.map((filter) => (
                  <td key={filter.value} className="border-2 border-gray-500">
                    {filter.options?.map((option) => (
                      <div key={option} className="flex flex-row gap-2">
                        <input
                          type="radio"
                          id={option}
                          checked={stagedFilters.some(
                            (stagedFilter) =>
                              stagedFilter.selected_option === option,
                          )}
                          onChange={() => {
                            console.log("changed");
                          }}
                          className={`mr-2 ml-2 ${optionChecked ? "animate-pulse" : ""}`}
                          onClick={() => {
                            updateStagedFilters(filter, option);
                            setOptionChecked(true);
                            setTimeout(() => setOptionChecked(false), 500);
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

    return (
      <div className="flex flex-col gap-2">
        <div
          className={
            "grid gap-2 my-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
          }
        >
          {showFilterTable && renderFiltersTable()}
          {coursesFetched &&
            !showFilterTable &&
            settingsFetched &&
            renderCourses()}
        </div>
        {renderPresetFilters()}
      </div>
    );
  };

  const handleCourseSelection = (course: Course) => {
    setActiveCourse(course);
    onSelect(false);
  };

  const handleApplyFilters = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    const courseFilters = stagedFilters.map((filter) => ({
      option: filter.selected_option?.toString() ?? "",
      param_code: filter.param_code ?? "",
    }));

    setSelectedFilters(courseFilters);
    setStagedFilters([]);
  };

  const handleSavePreset = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    const preset = {
      name: presetName,
      id: uuidv4(),
      filters: stagedFilters.map((filter) => ({
        option: filter.selected_option ?? "",
        param_code: filter.param_code ?? "",
      })),
    };

    // Check if an identical preset already exists
    const isDuplicate = courseFilterPresets.some((existingPreset) =>
      existingPreset.filters.every((filter) =>
        preset.filters.some(
          (newFilter) =>
            newFilter.option === filter.option &&
            newFilter.param_code === filter.param_code,
        ),
      ),
    );

    if (!isDuplicate) {
      setCourseFilterPresets([...courseFilterPresets, preset]);
      setStagedFilters([]);
      setPresetName("");
      void updateUserCourseFilterPresets();
    } else {
      openDialog({
        title: "Duplicate Preset",
        message: "This filter combination already exists.",
        buttons: [
          {
            label: "Close",
            autoFocus: false,
            action: () => closeDialog(),
            color: "RED",
          },
        ],
        excludeCancel: true,
      });
    }
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
              title={"Save Preset"}
              onClick={(e) => void handleSavePreset(e)}
              autoFocus={false}
            />

            <PaletteActionButton
              color={"GREEN"}
              title={"Apply Filters"}
              onClick={(e) => void handleApplyFilters(e)}
              autoFocus={false}
            />
          </>
        )}
        <ChoiceDialog />
      </div>
    </div>
  );
}
