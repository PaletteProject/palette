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
    const grades = localStorage.getItem(STORAGE_KEY);
    return grades ? JSON.parse(grades) : [];
  }
  
  /**
   * Save grades to local storage
   */
  export function saveGrades(grades: LocalGrade[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(grades));
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
  