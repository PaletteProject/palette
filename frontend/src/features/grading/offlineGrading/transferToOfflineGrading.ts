export function transferToOfflineGrading(
    activeCourseId: string,
    activeAssignmentId: string,
    rubricId: string
  ) {
    if (!activeCourseId || !activeAssignmentId || !rubricId) {
      alert("No course, assignment, or rubric selected.");
      return;
    }
  
    // Store active course and assignment for later retrieval
    localStorage.setItem("lastActiveCourse", activeCourseId);
    localStorage.setItem("lastActiveAssignment", activeAssignmentId);
  
    // Define original storage keys
    const gradesKey = `localGrades_${activeCourseId}_${activeAssignmentId}_rubric_${rubricId}`;
    const submissionsKey = `submissions_${activeCourseId}_${activeAssignmentId}`;
    const studentsKey = `parsedStudents_${activeCourseId}_${activeAssignmentId}`;
    const rubricKey = `rubric_${rubricId}`;  // Added rubric storage key
  
    // Define new offline storage keys
    const offlineGradesKey = `offlineGrades_${activeCourseId}_${activeAssignmentId}_rubric_${rubricId}`;
    const offlineSubmissionsKey = `offlineSubmissions_${activeCourseId}_${activeAssignmentId}`;
    const offlineStudentsKey = `offlineParsedStudents_${activeCourseId}_${activeAssignmentId}`;
    const offlineRubricKey = `offlineRubric_${rubricId}`; // Added offline rubric key
  
    // Transfer Grades
    const storedGrades = localStorage.getItem(gradesKey);
    if (storedGrades) {
      localStorage.setItem(offlineGradesKey, storedGrades);
      console.log(`✅ Transferred Grades from ${gradesKey} to ${offlineGradesKey}`);
    }
  
    // Transfer Submissions
    const storedSubmissions = localStorage.getItem(submissionsKey);
    if (storedSubmissions) {
      localStorage.setItem(offlineSubmissionsKey, storedSubmissions);
      console.log(`✅ Transferred Submissions from ${submissionsKey} to ${offlineSubmissionsKey}`);
    }
  
    // Transfer Students
    const storedStudents = localStorage.getItem(studentsKey);
    if (storedStudents) {
      localStorage.setItem(offlineStudentsKey, storedStudents);
      console.log(`✅ Transferred Students from ${studentsKey} to ${offlineStudentsKey}`);
    }
  
    // Transfer Rubric
    const storedRubric = localStorage.getItem(rubricKey);
    if (storedRubric) {
      localStorage.setItem(offlineRubricKey, storedRubric);
      console.log(`✅ Transferred Rubric from ${rubricKey} to ${offlineRubricKey}`);
    }
  
    // Notify the user
    alert("Grading data transferred to Offline Grading.");
  }
  