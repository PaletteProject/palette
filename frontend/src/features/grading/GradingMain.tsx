import {
  ChangeEvent,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  GroupedSubmissions,
  PaletteAPIResponse,
} from "palette-types";
import { useFetch } from "@/hooks";
import {
  GradingProvider,
  useAssignment,
  useCourse,
  useRubric,
} from "@/context";
import { parseCSV, ParsedStudent } from "./csv/gradingCSV.ts";
import { exportAllGroupsCSV } from "./csv/exportAllGroups.ts";
import { OfflineGradingView } from "./offlineGrading/offlineGradingView";
import { transferToOfflineGrading } from "./offlineGrading/transferToOfflineGrading.ts";
import {
  LoadingDots,
  MainPageTemplate,
  NoAssignmentSelected,
  NoCourseSelected,
  PaletteActionButton,
} from "@/components";
import { SubmissionsDashboard } from "@/features";

export function GradingMain(): ReactElement {
  const [submissions, setSubmissions] = useState<GroupedSubmissions>({
    "No Group": [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [transferring, setTransferring] = useState<boolean>(false);
  const [builderOpen, setBuilderOpen] = useState<boolean>(false);

  const { activeCourse } = useCourse();
  const { activeAssignment } = useAssignment();
  const { activeRubric } = useRubric();

  const fetchSubmissionsURL = `/courses/${activeCourse?.id}/assignments/${activeAssignment?.id}/submissions`;
  const { fetchData: getSubmissions } = useFetch(fetchSubmissionsURL);

  useEffect(() => {
    if (activeCourse && activeAssignment) {
      void fetchSubmissions();

      if (activeRubric) {
        const rubricKey = `rubric_${activeRubric.id}`;
        localStorage.setItem(rubricKey, JSON.stringify(activeRubric));
      }
    }
  }, [activeCourse, activeAssignment, activeRubric]);

  useEffect(() => {
    if (!activeCourse || !activeAssignment) return;
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

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const parsed = await parseCSV(file);
    localStorage.setItem(
      `studentsCSV_${activeAssignment?.id}`,
      JSON.stringify(parsed),
    );
    alert(`✅ Imported ${parsed.length} students from CSV.`);
  };

  const handleExportAllGroups = () => {
    if (!activeAssignment || !activeCourse) return;
    exportAllGroupsCSV(activeCourse.id.toString(), activeAssignment.id.toString());
  };

  const renderContent = () => {
    if (!loading && activeCourse && activeAssignment) {
      return (
        <>
          <div className="mb-4">
            <div className="flex gap-4 items-center mb-2">
              {!isOfflineMode && (
                <>
                  <label className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg cursor-pointer">
                    Upload Grades CSV
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
  
                  <PaletteActionButton
                    color="GREEN"
                    onClick={handleExportAllGroups}
                    title="Export Groups to CSV"
                  />
                </>
              )}
            </div>
  
            {/* Toggle + Transfer Button Row */}
            <div className="flex gap-4 items-center mt-2">
            <PaletteActionButton
              color={isOfflineMode ? "GRAY" : "BLUE"}
              title={
                isOfflineMode ? "Switch to Canvas Grading" : "Switch to Offline Grading"
              }
              onClick={() => setIsOfflineMode(!isOfflineMode)}
            />

            {!isOfflineMode && Object.keys(submissions).length > 0 && (
              <PaletteActionButton
                color="YELLOW"
                title={transferring ? "Transferring..." : "Transfer to Offline Grading"}
                onClick={() => {
                  if (!transferring) {
                    setTransferring(true);
                    transferToOfflineGrading(activeCourse, activeAssignment, activeRubric);
                    setTimeout(() => setTransferring(false), 2000);
                  }
                }}
                disabled={transferring}
              />
            )}
          </div>

          </div>
  
          {isOfflineMode ? (
            <OfflineGradingView />
          ) : (
            <GradingProvider>
              <SubmissionsDashboard
                submissions={submissions}
                fetchSubmissions={fetchSubmissions}
                setLoading={setLoading}
                builderOpen={builderOpen}
                setBuilderOpen={setBuilderOpen}
              />
            </GradingProvider>
          )}
        </>
      );
    }
  
    return (
      <div className="grid h-full">
        {loading && <LoadingDots />}
        {!activeCourse && <NoCourseSelected />}
        {activeCourse && !activeAssignment && <NoAssignmentSelected />}
      </div>
    );
  };
  
  return <MainPageTemplate>{renderContent()}</MainPageTemplate>;
  
}
