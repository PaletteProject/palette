export type LocalGrade = {
  userId: string;
  groupId: string;
  grade: number;
};

const getStorageKey = (
  activeCourseId: string,
  activeAssignmentId: string,
  rubricId: string,
): string => {
  return `localGrades_${activeCourseId}_${activeAssignmentId}_rubric_${rubricId}`;
};

/**
 * Get stored grades from local storage
 */
export function getStoredGrades(
  activeCourseId: string,
  activeAssignmentId: string,
  rubricId: string,
): LocalGrade[] {
  try {
    const storageKey = getStorageKey(
      activeCourseId,
      activeAssignmentId,
      rubricId,
    );
    const grades = localStorage.getItem(storageKey);
    return grades ? (JSON.parse(grades) as LocalGrade[]) : [];
  } catch (error) {
    console.error("Failed to parse local grades:", error);
    return [];
  }
}

/**
 * Save grades to local storage
 */
export function saveGrades(
  grades: LocalGrade[],
  activeCourseId: string,
  activeAssignmentId: string,
  rubricId: string,
) {
  try {
    const storageKey = getStorageKey(
      activeCourseId,
      activeAssignmentId,
      rubricId,
    );
    localStorage.setItem(storageKey, JSON.stringify(grades));
  } catch (error) {
    console.error("Failed to save grades to local storage:", error);
  }
}

/**
 * Add or update a grade
 */
export function updateGrade(
  userId: string,
  groupId: string,
  grade: number,
  activeCourseId: string,
  activeAssignmentId: string,
  rubricId: string,
) {
  if (!activeCourseId || !activeAssignmentId || !rubricId) {
    console.warn("Missing course, assignment, or rubric. Cannot update grade.");
    return;
  }

  const storageKey = getStorageKey(
    activeCourseId,
    activeAssignmentId,
    rubricId,
  );
  const gradesRaw = localStorage.getItem(storageKey);
  const grades: LocalGrade[] = gradesRaw
    ? (JSON.parse(gradesRaw) as LocalGrade[])
    : [];

  const index = grades.findIndex((g: LocalGrade) => g.userId === userId);
  if (index !== -1) {
    grades[index].grade = grade;
  } else {
    grades.push({ userId, groupId, grade });
  }

  localStorage.setItem(storageKey, JSON.stringify(grades));
  console.log(`Updated grades for ${storageKey}:`, grades);
}

/**
 * Clear all grades for a specific assignment & rubric from local storage
 */
export function clearGrades(
  activeCourseId: string,
  activeAssignmentId: string,
  rubricId: string,
) {
  try {
    const storageKey = getStorageKey(
      activeCourseId,
      activeAssignmentId,
      rubricId,
    );
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Failed to clear grades from local storage:", error);
  }
}

/**
 * Get a specific grade for a user in a group
 */
export function getGrade(
  userId: string,
  groupId: string,
  activeCourseId: string,
  activeAssignmentId: string,
  rubricId: string,
): number | undefined {
  const grades = getStoredGrades(activeCourseId, activeAssignmentId, rubricId);
  const gradeEntry = grades.find(
    (g) => g.userId === userId && g.groupId === groupId,
  );
  return gradeEntry ? gradeEntry.grade : undefined;
}
