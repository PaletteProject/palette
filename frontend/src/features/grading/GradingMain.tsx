import {
  ChangeEvent,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import { GroupedSubmissions, PaletteAPIResponse } from "palette-types";
import { useFetch } from "@/hooks";
import {
  GradingProvider,
  useAssignment,
  useCourse,
  useRubric,
} from "@/context";
import { parseCSV, ParsedStudent } from "./csv/gradingCSV.ts";
import { exportAllGroupsCSV } from "./csv/exportAllGroups.ts";
import {
  LoadingDots,
  MainPageTemplate,
  NoAssignmentSelected,
  NoCourseSelected,
  PaletteActionButton,
} from "@/components";

import { SubmissionsDashboard } from "@/features";

export function GradingMain(): ReactElement {
  // state
  const [submissions, setSubmissions] = useState<GroupedSubmissions>({
    "No Group": [],
  });

  const [loading, setLoading] = useState<boolean>(false);

  // context providers
  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();
  const { activeRubric } = useRubric();

  // url string constants
  const fetchSubmissionsURL = `/courses/${activeCourse?.id}/assignments/${activeAssignment?.id}/submissions`;

  const { fetchData: getSubmissions } = useFetch(fetchSubmissionsURL);

  const [builderOpen, setBuilderOpen] = useState<boolean>(false);

  /**
   * Load students from local storage on component mount
   */
  useEffect(() => {
    if (activeCourse && activeAssignment) {
      const storageKey = `parsedStudents_${activeCourse.id}_${activeAssignment.id}`;
      const storedStudentsString = localStorage.getItem(storageKey);

      if (storedStudentsString) {
        try {
          const storedStudentsRaw = localStorage.getItem(storageKey);
          const storedStudents: ParsedStudent[] = storedStudentsRaw
            ? (JSON.parse(storedStudentsRaw) as ParsedStudent[])
            : [];
          console.log(
            `Retrieved students for ${activeAssignment.id}:`,
            storedStudents,
          );
        } catch (error) {
          console.error(
            "Error parsing stored students from localStorage:",
            error,
          );
        }
      }
    }
  }, [activeCourse, activeAssignment]);

  /**
   * Handle CSV Upload for group data
   */
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && activeCourse && activeAssignment) {
      console.log("📂 Uploading file:", file.name);

      parseCSV(file)
        .then((parsedStudents) => {
          console.log("Parsed Students:", parsedStudents);

          if (parsedStudents.length > 0) {
            const storageKey = `parsedStudents_${activeCourse.id}_${activeAssignment.id}`;
            localStorage.setItem(storageKey, JSON.stringify(parsedStudents));

            console.log(
              "Saved parsedStudents to localStorage under key:",
              storageKey,
            );
          } else {
            console.warn("Parsed students list is empty, not saving.");
          }
        })
        .catch((error) => {
          console.error(" Error parsing CSV:", error);
          alert("Failed to import CSV.");
        });
    }
  };

  /**
   * Export all group submissions to a CSV
   */
  const handleExportAllGroups = () => {
    if (activeRubric) {
      exportAllGroupsCSV(submissions, activeRubric);
    } else {
      alert("Cannot export: Missing rubric.");
    }
  };

  // fetch rubric and submissions when course or assignment change
  useEffect(() => {
    if (!activeCourse || !activeAssignment) {
      // prevent effect if either course or assignment is not selected
      return;
    }
    void fetchSubmissions();
  }, [activeCourse, activeAssignment]);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const response =
        (await getSubmissions()) as PaletteAPIResponse<GroupedSubmissions>;

      if (response.success && response.data) {
        setSubmissions(response.data);
      }
    } catch (error) {
      console.error("An error occurred while getting submissions: ", error);
    } finally {
      setLoading(false);
    }
  }, [getSubmissions]);

  const renderContent = () => {
    if (!loading && activeCourse && activeAssignment) {
      return (
        <>
          <div className="flex gap-4 items-center mt-2 p-2">
            <label className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg cursor-pointer">
              Upload Grades CSV
              {/*todo: use a callback hook here instead w/ palette action button */}
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <PaletteActionButton
              color={"GREEN"}
              onClick={handleExportAllGroups}
              title={"Export Groups to CSV"}
            />
          </div>

          <GradingProvider>
            <SubmissionsDashboard
              submissions={submissions}
              fetchSubmissions={fetchSubmissions}
              setLoading={setLoading}
              builderOpen={builderOpen}
              setBuilderOpen={setBuilderOpen}
            />
          </GradingProvider>
        </>
      );
    }

    return (
      <>
        <div className={"grid h-full"}>
          {loading && <LoadingDots />}
          {!activeCourse && <NoCourseSelected />}
          {activeCourse && !activeAssignment && <NoAssignmentSelected />}
        </div>
      </>
    );
  };

  return <MainPageTemplate>{renderContent()}</MainPageTemplate>;
}
