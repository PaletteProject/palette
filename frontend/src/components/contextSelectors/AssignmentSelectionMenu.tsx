import { ReactElement, useEffect, useState } from "react";
import { Assignment, PaletteAPIResponse } from "palette-types";
import { useFetch } from "@hooks";
import { useCourse } from "@context";
import { useAssignment } from "../../context/AssignmentProvider.tsx";
import { LoadingDots } from "@components";

export function AssignmentSelectionMenu({
  onSelect,
}: {
  onSelect: (open: boolean) => void;
}): ReactElement {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { activeCourse } = useCourse();
  const { setActiveAssignment } = useAssignment();

  const { fetchData: getAssignments } = useFetch(
    `/courses/${activeCourse?.id}/assignments`,
  );

  useEffect(() => {
    if (!activeCourse) return;
    void fetchAssignments();
  }, []);

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
          "grid gap-2 my-4 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
        }
      >
        <div className={"grid gap-2 mt-0.5"}>
          {assignments.map((assignment: Assignment) => (
            <div
              key={assignment.id}
              className={
                "flex gap-4 bg-gray-600 hover:bg-gray-500 px-3 py-1 cursor-pointer rounded-full text-2xl font-bold"
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

  return (
    <div className={"grid gap-2 text-2xl"}>
      {activeCourse ? <p>Assignments for {activeCourse.name}</p> : null}
      <div>{renderAssignments()}</div>
      <button
        onClick={void fetchAssignments}
        className={
          "justify-self-end text-2xl bg-blue-500 px-2 py-1 rounded-full hover:opacity-80 active:opacity-70"
        }
        type={"button"}
      >
        Refresh
      </button>
    </div>
  );
}
