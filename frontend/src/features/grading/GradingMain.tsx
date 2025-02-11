import { ReactElement, useEffect, useState } from "react";
import { GroupedSubmissions, PaletteAPIResponse, Rubric } from "palette-types";
import { useFetch } from "@hooks";
import { useAssignment, useCourse } from "@context";
import { parseCSV, ParsedStudent } from "./csv/gradingCSV.ts";
import { getStoredGrades, updateGrade } from "./gradingStorage/gradingStorage";

import {
  LoadingDots,
  MainPageTemplate,
  NoAssignmentSelected,
  NoCourseSelected,
} from "@components";

import { SubmissionsDashboard } from "@features";

export function GradingMain(): ReactElement {
  // state
  const [rubric, setRubric] = useState<Rubric>();
  const [submissions, setSubmissions] = useState<GroupedSubmissions>({
    "no-group": [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
 
  // context providers
  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();

  // url string constants
  const fetchSubmissionsURL = `/courses/${activeCourse?.id}/assignments/${activeAssignment?.id}/submissions`;
  const getRubricURL = `/courses/${activeCourse?.id}/rubrics/${activeAssignment?.rubricId}`;

  // define fetch hooks
  const { fetchData: getRubric } = useFetch(getRubricURL);
  const { fetchData: getSubmissions } = useFetch(fetchSubmissionsURL);

    /**
   * Handle CSV Upload for group data
   */
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && activeCourse && activeAssignment) {
        try {
          const parsedStudents = await parseCSV(file);
          parsedStudents.forEach((student) => {
            updateGrade(student.userId, student.groupName, 0); // Initialize grades to 0 for now
          });
          alert("CSV imported successfully!");
        } catch (error) {
          console.error("Error parsing CSV:", error);
          alert("Failed to import CSV.");
        }
      }
    };
  
  /**
   * Clear state prior to fetch operations.
   */
  const resetState = () => {
    setRubric(undefined);
    setSubmissions({ "no-group": [] });
  };

  // fetch rubric and submissions when course or assignment change
  useEffect(() => {
    if (!activeCourse || !activeAssignment) {
      // prevent effect if either course or assignment is not selected
      return;
    }

    resetState();
    setLoading(true);
    void fetchRubric();
    void fetchSubmissions();
  }, [activeCourse, activeAssignment]);

  const fetchRubric = async () => {
    if (!activeAssignment?.rubricId) return; // avoid fetch if assignment doesn't have an associated rubric
    try {
      const response = (await getRubric()) as PaletteAPIResponse<Rubric>;

      if (response.success) {
        setRubric(response.data);
      }
    } catch (error) {
      console.error("An error occurred while getting rubric: ", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
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
  };

  const renderContent = () => {
    if (!loading && activeCourse && activeAssignment) {
      return (
        <>
          <div className="mb-4">
            <h2>Upload Grades CSV</h2>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
          </div>
          <SubmissionsDashboard 
          submissions={submissions} 
          rubric={rubric} 
          fetchSubmissions={fetchSubmissions} 
          />
        </>
      );
    }

    return (
      <div className={"grid h-full"}>
        {loading && <LoadingDots />}
        {!activeCourse && <NoCourseSelected />}
        {activeCourse && !activeAssignment && <NoAssignmentSelected />}
      </div>
    );
  };

  return <MainPageTemplate>{renderContent()}</MainPageTemplate>;
}
