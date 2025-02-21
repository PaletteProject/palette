import { ReactElement, useEffect, useState } from "react";
import { GroupedSubmissions, PaletteAPIResponse, Rubric } from "palette-types";
import { useFetch } from "@hooks";
import { useAssignment, useCourse } from "@context";
import { parseCSV, ParsedStudent } from "./csv/gradingCSV.ts";
import { getStoredGrades, updateGrade } from "./gradingStorage/gradingStorage";
import { exportAllGroupsCSV } from "./csv/exportAllGroups.ts"; // Import the export function
import  GradingUI  from "./gradingStorage/gradingUI";


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
    "No Group": [],
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
   * Load students from local storage on component mount
   */
    useEffect(() => {
      if (activeCourse && activeAssignment) {
        const storageKey = `parsedStudents_${activeCourse.id}_${activeAssignment.id}`;
        const storedStudents = JSON.parse(localStorage.getItem(storageKey) || "[]");
    
        console.log(`Retrieved students for ${activeAssignment.id}:`, storedStudents);
        setParsedStudents(storedStudents);
      }
    }, [activeCourse, activeAssignment]);
    

    /**
   * Handle CSV Upload for group data
   */
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
    
      if (file && activeCourse && activeAssignment) {
        try {
          console.log("Uploading file:", file.name);
    
          const parsedStudents = await parseCSV(file);
          console.log("Parsed Students:", parsedStudents);
    
          if (parsedStudents.length > 0) {
            // Save parsed students under a unique key per assignment
            const storageKey = `parsedStudents_${activeCourse.id}_${activeAssignment.id}`;
            localStorage.setItem(storageKey, JSON.stringify(parsedStudents));
    
            console.log("Saved parsedStudents to localStorage under key:", storageKey);
            setParsedStudents(parsedStudents);
          } else {
            console.warn("Parsed students list is empty, not saving.");
          }
        } catch (error) {
          console.error("Error parsing CSV:", error);
          alert("Failed to import CSV.");
        }
      }
    };
    
    
  
    /**
   * Export all group submissions to a CSV
   */
    const handleExportAllGroups = () => {
      if (rubric) {
        exportAllGroupsCSV(submissions, rubric);
      } else {
        alert("Cannot export: Missing rubric.");
      }
    };
  
  

  /**
   * Clear state prior to fetch operations.
   */
  const resetState = () => {
    setRubric(undefined);
    setSubmissions({ "No Group": [] });
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
  };

  const renderContent = () => {
    if (!loading && activeCourse && activeAssignment) {
      return (
        <>
       
        <div className="flex gap-4 items-center mb-4">
          <label className="bg-blue-500 text-white font-bold py-2 px-4 rounded cursor-pointer">
            Upload Grades CSV
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              className="hidden"
            />
          </label>

          <button
            className="bg-green-500 text-white font-bold py-2 px-4 rounded"
            onClick={handleExportAllGroups}
          >
            Export All Groups to CSV
          </button>
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
