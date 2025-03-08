import { MouseEvent, ReactElement, useEffect, useState } from "react";
import { Assignment, PaletteAPIResponse, Settings } from "palette-types";
import { useFetch } from "@hooks";
import { useChoiceDialog, useCourse } from "@context";
import { useAssignment } from "../../context/AssignmentProvider.tsx";
import { ChoiceDialog } from "../modals/ChoiceDialog.tsx";

import {
  LoadingDots,
  PaletteActionButton,
  PaletteTable,
  PaletteTrash,
} from "@components";
import { v4 as uuidv4 } from "uuid";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  const [showSearchBar, setShowSearchBar] = useState<boolean>(true);
  const [settingsFetched, setSettingsFetched] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState<
    { option: string; param_code: string }[]
  >([]);
  const [assignmentsFetched, setAssignmentsFetched] = useState<boolean>(false);
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

  const { fetchData: getAssignments } = useFetch(
    `/courses/${activeCourse?.id}/assignments`
  );

  const { fetchData: updateUserAssignmentFilters } = useFetch(
    "/user/settings/assignment_filters",
    {
      method: "PUT",
      body: JSON.stringify(selectedFilters),
    }
  );

  const { fetchData: updateUserAssignmentFilterPresets } = useFetch(
    "/user/settings/assignment_filter_presets",
    {
      method: "PUT",
      body: JSON.stringify(assignmentFilterPresets),
    }
  );

  const currentMonth = new Date().getMonth() + 1;

  function getMonthName(month: number) {
    if (month <= 0) {
      month = month + 12;
    }
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[month - 1];
  }
  const preDefinedFilters = [
    {
      label: "Published",
      value: "published",
      options: ["published", "unpublished"],
      selected_option: "",
      param_code: "published",
    },
    {
      label: "Created At",
      value: "created_at",
      options: [
        getMonthName(currentMonth),
        getMonthName(currentMonth - 1),
        getMonthName(currentMonth - 2),
        getMonthName(currentMonth - 3),
      ],
      selected_option: "",
      param_code: "created_at",
    },
  ];

  useEffect(() => {
    if (!activeCourse) return;
    void fetchUserSettings();
    setSettingsFetched(true);
  }, []);

  useEffect(() => {
    if (selectedFilters.length > 0) {
      console.log("selectedFilters:", selectedFilters);
      void updateUserAssignmentFilters();
      void fetchAssignments();
      setAssignmentsFetched(true);
      setShowFilterTable(false);
    }
  }, [selectedFilters]);

  useEffect(() => {
    console.log("assignmentFilterPresets:", assignmentFilterPresets);
    console.log("deletedPreset:", deletedPreset);
    if (assignmentFilterPresets.length > 0 || deletedPreset) {
      void updateUserAssignmentFilterPresets();
    }
  }, [assignmentFilterPresets]);

  const handleSearchAssignments = (
    event: MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();

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

    console.log("preset");
    console.log(preset);

    // Check if an identical preset already exists
    const isDuplicate = assignmentFilterPresets.some((existingPreset) =>
      existingPreset.filters.every((filter) =>
        preset.filters.some(
          (newFilter) =>
            newFilter.option === filter.option &&
            newFilter.param_code === filter.param_code
        )
      )
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
        <input
          type="text"
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          placeholder="Search for an assignment by name"
          className="bg-gray-600 hover:bg-gray-500 px-3 py-3 cursor-pointer rounded-lg font-bold text-sm w-full"
        />
        <PaletteActionButton
          color={"BLUE"}
          title={"Search"}
          onClick={handleSearchAssignments}
          autoFocus={true}
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
    }

    setStagedFilters(newStagedFilters);
  };

  const renderPresetFilters = () => {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2 items-center">
          <h2 className="text-gray-400 text-md">Saved Presets</h2>
          {assignmentFilterPresets.length > 0 && (
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
                              (p) => p.id !== preset.id
                            )
                          );
                          setDeletedPreset(true);
                        }}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 flex-1 mt-1">
                    {preDefinedFilters.map((preDefinedFilter) => {
                      const matchingFilter = preset.filters.find(
                        (f) => f.param_code === preDefinedFilter.param_code
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

  const renderAssignmentFilterTable = () => {
    return (
      <div className="flex flex-col gap-2 p-2">
        {/* <h2 className="text-gray-400 text-md">Create Custom Filter</h2> */}

        {
          <table className="border-2 border-gray-500 rounded-lg text-sm w-full">
            <thead className="bg-gray-600 border-2 border-gray-500">
              <tr className="grid grid-cols-2">
                {/* Filter Labels */}
                {preDefinedFilters.map((filter) => (
                  <th key={filter.value} className="border-2 border-gray-500">
                    {filter.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="grid grid-cols-2">
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
                              stagedFilter.selected_option === option
                          )}
                          onChange={() => {
                            console.log("changed");
                          }}
                          className={`mr-2 ml-2`}
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
    if (assignments.length === 0)
      return <div>No assignments are available to display</div>;

    return (
      <div
        className={
          "grid gap-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
        }
      >
        <div className={"grid gap-2 mt-0.5"}>
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
        error
      );
      setErrorMessage(
        "An unexpected error occurred while fetching assignments."
      );
    }
    setLoading(false);
  };

  const fetchUserSettings = async () => {
    const response = (await getUserSettings()) as PaletteAPIResponse<Settings>;
    if (response.success) {
      setAssignmentFilterPresets(
        response.data?.assignment_filter_presets ?? []
      );
    }
  };

  const handleGetAssignments = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    void fetchAssignments();
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
      {showSearchBar && renderSearchBar()}
      {showFilterTable ? <div>{renderAssignmentFilterTable()}</div> : null}
      {assignmentsFetched ? renderAssignments() : null}
      {renderPresetFilters()}
      <div className={"justify-self-end flex flex-row gap-2 items-center"}>
        {assignmentsFetched ? (
          <PaletteActionButton
            color={"BLUE"}
            title={"Refresh"}
            onClick={handleGetAssignments}
            autoFocus={true}
          />
        ) : null}
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
