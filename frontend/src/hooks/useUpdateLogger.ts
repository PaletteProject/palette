import { useEffect } from "react";

// dev hook to log updates to a value or object
export function useUpdateLogger<T>(value: T) {
  useEffect(() => {
    console.log(value, "updated");
  }, [value]);
}
