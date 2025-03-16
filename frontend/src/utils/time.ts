/**
 * Helper function to format the current date/time for the copy title
 */
export const formatDate = () => new Date().toLocaleString().replace(/\//g, "-");

export function getMonthName(month: number) {
  if (month <= 0) {
    month = month + 12;
  }
  const monthNames = [
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
  return monthNames[month - 1];
}
