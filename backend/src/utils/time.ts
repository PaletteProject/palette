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

export function monthCompare(month1: string, month2: string) {
  const months = [
    { name: "January", value: 1 },
    { name: "February", value: 2 },
    { name: "March", value: 3 },
    { name: "April", value: 4 },
    { name: "May", value: 5 },
    { name: "June", value: 6 },
    { name: "July", value: 7 },
    { name: "August", value: 8 },
    { name: "September", value: 9 },
    { name: "October", value: 10 },
    { name: "November", value: 11 },
    { name: "December", value: 12 },
  ];
  const month1Index = months.findIndex((month) => month.name === month1);
  const month2Index = months.findIndex((month) => month.name === month2);
  return month1Index <= month2Index;
}
