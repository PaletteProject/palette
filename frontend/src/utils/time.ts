/**
 * Helper function to format the current date/time for the copy title
 */
export const formatDate = () => new Date().toLocaleString().replace(/\//g, "-");

export function getDateString(
  month: number,
  year = new Date().getFullYear(),
): Date {
  return new Date(year, month, 0);
}

export function getMonthName(month: number): string {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
  const currentYear = currentDate.getFullYear();

  // If the requested month is after the current month, use previous year
  if (month <= 0) month = month + 12; //normalize to 1-12

  const year = month < currentMonth ? currentYear - 1 : currentYear;

  const months = [
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

  return `${months[month - 1]} ${year}`;
}
