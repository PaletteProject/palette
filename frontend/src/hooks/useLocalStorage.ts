import { useState, useEffect } from "react";

// Function to retrieve the stored value from localStorage or return the initial value
function getStoredValue<T>(key: string, initialValue: T | (() => T)): T {
  // Attempt to parse the stored value from localStorage
  const storedValue = JSON.parse(localStorage.getItem(key) || "null") as T;
  if (storedValue !== null) return storedValue; // Return the stored value if it exists
  if (typeof initialValue === "function") {
    // If the initial value is a function, call it to get the value
    return (initialValue as () => T)();
  }
  return initialValue; // Return the initial value if no stored value exists
}

// Custom hook to manage state with localStorage
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  // Initialize state with the stored value or initial value
  const [value, setValue] = useState<T>(() => {
    return getStoredValue<T>(key, initialValue);
  });

  // Update localStorage whenever the key or value changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  // Return the current value and a function to update it
  return [value, setValue];
}
