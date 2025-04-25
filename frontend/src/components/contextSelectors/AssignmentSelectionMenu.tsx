import { MouseEvent, ReactElement, useEffect, useState } from "react";
import { Assignment, PaletteAPIResponse, Settings } from "palette-types";
import { useFetch } from "@/hooks";
import { useAssignment, useChoiceDialog, useCourse } from "@/context";
import { ChoiceDialog } from "../modals/ChoiceDialog.tsx";

import {
  LoadingDots,
  PaletteActionButton,
  PaletteTable,
  PaletteTrash,
} from "@/components";
import { v4 as uuidv4 } from "uuid";
import {
  faChevronDown,
  faChevronUp,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getMonthName } from "@/utils/time";

export function AssignmentSelectionMenu({
  onSelect,
}: {
  onSelect: (open: boolean) => void;
}): ReactElement {
  const { openDialog, closeDialog } = useChoiceDialog();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [deletedPreset, setDeletedPreset] = useState<boolean>(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [optionChecked, setOptionChecked] = useState<boolean>(false);
  const [showPresetDeleteButtons, setShowPresetDeleteButtons] =
    useState<boolean>(false);
  const [presetName, setPresetName] = useState<string>("");
  const [showFilterTable, setShowFilterTable] = useState<boolean>(false);
  const [showAssignments, setShowAssignments] = useState<boolean>(false);
  const [selectedFilterName, setSelectedFilterName] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<
    { option: string; param_code: string }[]
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
  const [assignmentFilterPresets, setAssignmentFilterPresets] = useState<
    {
      id: string;
      name: string;
      filters: { option: string; param_code: string }[];
    }[]
  >([]);
  const { activeCourse } = useCourse();
  const { setActiveAssignment } = useAssignment();
  const { fetchData: getUserSettings } = useFetch("/user/settings");
  const [isAssignmentsExpanded, setIsAssignmentsExpanded] =
    useState<boolean>(true);
  const [isPresetsExpanded, setIsPresetsExpanded] = useState<boolean>(false);

  const { fetchData: getAssignments } = useFetch(
    `/courses/${activeCourse?.id}/assignments`,
  );

  const { fetchData: updateUserAssignmentFilters } = useFetch(
    "/user/settings/assignment_filters",
    {
      method: "PUT",
      body: JSON.stringify(selectedFilters),
    },
  );

  const { fetchData: updateUserAssignmentFilterPresets } = useFetch(
    "/user/settings/assignment_filter_presets",
    {
      method: "PUT",
      body: JSON.stringify(assignmentFilterPresets),
    },
  );

  const currentMonth = new Date().getMonth() + 1;

  const preDefinedFilters = [
    {
      label: "Due In This Month",
      value: "due_at",
      options: [
        getMonthName(currentMonth),
        getMonthName(currentMonth + 1),
        getMonthName(currentMonth + 2),
        getMonthName(currentMonth + 3),
        getMonthName(currentMonth + 4),
      ],
      selected_option: "",
      param_code: "due_at",
    },
  ];

  useEffect(() => {
    if (!activeCourse) return;
    void fetchUserSettings();
  }, []);

  useEffect(() => {
    if (selectedFilters.length > 0) {
      void updateUserAssignmentFilters();
      void fetchAssignments();
      setShowAssignments(true);
      setShowFilterTable(false);
    }
  }, [selectedFilters]);

  useEffect(() => {
    if (assignmentFilterPresets.length > 0 || deletedPreset) {
      void updateUserAssignmentFilterPresets();
    }
  }, [assignmentFilterPresets]);

  const handleSearchAssignments = (
    event: MouseEvent<HTMLButtonElement>,
  ): void => {
    event.preventDefault();

    // If the search query is empty, get all assignments.
    // This is implied in the backend.
    setSelectedFilters([
      {
        option: searchQuery,
        param_code: "name",
      },
    ]);
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
    const isDuplicate = assignmentFilterPresets.some((existingPreset) =>
      existingPreset.filters.every((filter) =>
        preset.filters.some(
          (newFilter) =>
            newFilter.option === filter.option &&
            newFilter.param_code === filter.param_code,
        ),
      ),
    );

    if (!isDuplicate) {
      setAssignmentFilterPresets([...assignmentFilterPresets, preset]);
      setStagedFilters([]);
      setPresetName("");
      void updateUserAssignmentFilterPresets();
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

  const renderSearchBar = () => {
    return (
      <div className="flex flex-row gap-2 items-center">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            placeholder="Search for an assignment by name"
            className="bg-gray-600 hover:bg-gray-500 px-3 py-3 cursor-pointer rounded-lg font-bold text-sm w-full pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              type="button"
            >
              ✕
            </button>
          )}
        </div>
        <PaletteActionButton
          color={searchQuery == "" ? "GREEN" : "BLUE"}
          title={searchQuery == "" ? "Get All" : "Search"}
          onClick={handleSearchAssignments}
          autoFocus={false}
        />
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

    let newStagedFilters: {
      label: string;
      value: string;
      options?: string[];
      selected_option?: string;
      param_code?: string;
    }[];

    // Return a new array with the updated staged filter
    if (filterIndex === -1) {
      // If the filter is not in the array, add it
      newStagedFilters = [...stagedFilters, updatedStagedFilter];
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
    }

    setStagedFilters(newStagedFilters);
  };

  const renderPresetSection = () => {
    return (
      <>
        <hr className="w-full border-gray-500 mt-2 mb-2 border-2" />
        <div className="flex flex-col gap-2 bg-gray-800 rounded-lg">
          <div
            onClick={() => setIsPresetsExpanded(!isPresetsExpanded)}
            className="flex justify-between items-center px-3 mt-2 mb-2 rounded-lg"
          >
            <div className="flex flex-row gap-2 items-center hover:bg-gray-700 cursor-pointer rounded-lg px-2">
              <span className="font-bold">
                Saved Presets ({assignmentFilterPresets.length})
              </span>
              <FontAwesomeIcon
                icon={isPresetsExpanded ? faChevronUp : faChevronDown}
                className="text-gray-400"
              />
              {assignmentFilterPresets.length > 0 && isPresetsExpanded && (
                <FontAwesomeIcon
                  icon={faCog}
                  className="cursor-pointer text-gray-400 text-md ml-2"
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    setShowPresetDeleteButtons(!showPresetDeleteButtons);
                  }}
                />
              )}
            </div>
          </div>
          {isPresetsExpanded && (
            <div className="ml-2 mr-2 mt-2 mb-2">
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800">
                {assignmentFilterPresets.length === 0 && (
                  <div className="text-gray-300 font-normal">
                    No saved presets available
                  </div>
                )}
                {assignmentFilterPresets.map((preset) => (
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
                                setAssignmentFilterPresets(
                                  assignmentFilterPresets.filter(
                                    (p) => p.id !== preset.id,
                                  ),
                                );
                                setDeletedPreset(true);
                              }}
                            />
                          </div>
                        )}

                        <div className="flex flex-row gap-2 mt-1">
                          {preDefinedFilters.map((preDefinedFilter) => {
                            const matchingFilter = preset.filters.find(
                              (f) =>
                                f.param_code === preDefinedFilter.param_code,
                            );
                            return (
                              <p
                                key={preDefinedFilter.value}
                                className={`text-center flex items-center justify-center h-full ${
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
          )}
        </div>
      </>
    );
  };

  const renderAssignmentFilterTable = () => {
    return (
      <div className="flex flex-col gap-2 p-2">
        {/* <h2 className="text-gray-400 text-md">Create Custom Filter</h2> */}

        {
          <table className="border-2 border-gray-500 rounded-lg text-sm w-full">
            <thead className="bg-gray-600 border-2 border-gray-500">
              <tr className="grid grid-cols-1">
                {/* Filter Labels */}
                {preDefinedFilters.map((filter) => (
                  <th key={filter.value} className="border-2 border-gray-500">
                    {filter.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="grid grid-cols-1">
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

  const renderAssignments = () => {
    if (loading) return <LoadingDots />;
    if (errorMessage)
      return (
        <p className="text-red-500 font-normal mt-2">Error: {errorMessage}</p>
      );

    if (!activeCourse) {
      return (
        <div className={"text-red-500 font-medium mt-2"}>
          Select a course first to view assignments.
        </div>
      );
    }
    if (assignments.length === 0 && selectedFilterName !== "")
      return (
        <div className="text-red-500 font-medium mt-2">
          No assignments are available to display
        </div>
      );

    if (assignments.length === 0 && selectedFilterName === "")
      return (
        <div className="text-red-500 font-medium mt-2">
          Assignment not found
        </div>
      );

    return (
      <>
        <hr className="w-full border-gray-500 mt-2 mb-2" />
        <div className="flex flex-col gap-2 bg-gray-800 rounded-lg">
          <div
            onClick={() => setIsAssignmentsExpanded(!isAssignmentsExpanded)}
            className="flex justify-between items-center px-3 mt-2 mb-2 rounded-lg "
          >
            <div className="flex flex-row gap-2 items-center hover:bg-gray-700 cursor-pointer rounded-lg px-2">
              <span className="font-bold">
                Assignments ({assignments.length})
              </span>
              <FontAwesomeIcon
                icon={isAssignmentsExpanded ? faChevronUp : faChevronDown}
                className="text-gray-400"
              />
            </div>
          </div>
          {isAssignmentsExpanded && (
            <div className="ml-2 mr-2 mt-2 mb-2">
              <div
                className={
                  "grid gap-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
                }
              >
                <div className={"grid gap-2 mt-0.5 pr-2"}>
                  {assignments.map((assignment: Assignment) => (
                    <div
                      key={assignment.id}
                      className={
                        "flex gap-4 bg-gray-600 hover:bg-gray-500 px-3 py-1 cursor-pointer rounded-full text-lg font-bold"
                      }
                      onClick={() => handleAssignmentSelection(assignment)}
                    >
                      <h3>{assignment.name}</h3>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  const handleAssignmentSelection = (assignment: Assignment) => {
    setActiveAssignment(assignment);
    onSelect(false);
  };

  const handleApplyFilters = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    const assignmentFilters = stagedFilters.map((filter) => ({
      option: filter.selected_option?.toString() ?? "",
      param_code: filter.param_code ?? "",
    }));

    setSelectedFilterName(assignmentFilters[0].option);

    setSelectedFilters(assignmentFilters);
    setStagedFilters([]);
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = (await getAssignments()) as PaletteAPIResponse<
        Assignment[]
      >;

      if (response.success) {
        setAssignments(response.data!);
      } else {
        setErrorMessage(response.error || "Failed to get assignments");
      }
    } catch (error) {
      console.error(
        "An unexpected error occurred while getting assignments: ",
        error,
      );
      setErrorMessage(
        "An unexpected error occurred while fetching assignments.",
      );
    }
    setLoading(false);
  };

  const fetchUserSettings = async () => {
    const response = (await getUserSettings()) as PaletteAPIResponse<Settings>;
    if (response.success) {
      setAssignmentFilterPresets(
        response.data?.assignment_filter_presets ?? [],
      );
    }
  };

  return (
    <div className={"grid gap-2 text-xl mt-2"}>
      <div className={"flex flex-row gap-2 items-center"}>
        {activeCourse ? <p>{activeCourse.name}</p> : null}
        <PaletteTable
          onClick={() => {
            setShowFilterTable(!showFilterTable);
            setShowAssignments(false);
          }}
          focused={showFilterTable}
        />
      </div>
      {renderSearchBar()}

      {selectedFilterName && (
        <p className="text-gray-400 text-md">
          Showing assignments due in {selectedFilterName}
        </p>
      )}
      {showFilterTable ? <div>{renderAssignmentFilterTable()}</div> : null}
      {showAssignments ? renderAssignments() : null}
      {renderPresetSection()}
      <div className={"justify-self-end flex flex-row gap-2 items-center"}>
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
