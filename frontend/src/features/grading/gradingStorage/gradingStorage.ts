export type LocalGrade = {
    userId: string;
    groupId: string;
    grade: number;
  };
  
  const STORAGE_KEY = "localGrades";
  
  /**
   * Get stored grades from local storage
   */
  export function getStoredGrades(): LocalGrade[] {
    try {
      const grades = localStorage.getItem(STORAGE_KEY);
      return grades ? JSON.parse(grades) : [];
    } catch (error) {
    console.error("Failed to parse local grades:", error);
    return [];
    }
  }
  
  /**
   * Save grades to local storage
   */
  export function saveGrades(grades: LocalGrade[]) {
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(grades));
    }catch (error) {
        console.error("Failed to save grades to local storage:", error);
      }
  }
  
  /**
   * Add or update a grade
   */
  export function updateGrade(userId: string, groupId: string, grade: number) {
    const grades = getStoredGrades();
    const index = grades.findIndex((g) => g.userId === userId);
  
    if (index !== -1) {
      grades[index].grade = grade;
    } else {
      grades.push({ userId, groupId, grade });
    }
  
    saveGrades(grades);
  }

  /**
 * Clear all grades from local storage
 */
export function clearGrades() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear grades from local storage:", error);
  }
}

/**
 * Get a specific grade for a user in a group
 */
export function getGrade(userId: string, groupId: string): number | undefined {
  const grades = getStoredGrades();
  const gradeEntry = grades.find((g) => g.userId === userId && g.groupId === groupId);
  return gradeEntry ? gradeEntry.grade : undefined;
}
  