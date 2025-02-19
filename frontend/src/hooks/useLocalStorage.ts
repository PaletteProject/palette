import { useState, useEffect } from "react";

function getStoredValue(key: string, initialValue: any) {
  const storedValue = JSON.parse(localStorage.getItem(key) || "null");
  console.log(storedValue, "storedValue");
  if (storedValue) return storedValue;
  if (initialValue instanceof Function) return initialValue();
  return initialValue;
}

export function useLocalStorage(key: string, initialValue: any) {
  const [value, setValue] = useState(() => {
    return getStoredValue(key, initialValue);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value]);

  return [value, setValue];
}
