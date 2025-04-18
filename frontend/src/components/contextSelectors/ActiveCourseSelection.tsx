import { useCourse } from "@/context";
import { ReactElement } from "react";
import { ActiveSelectionButton } from "@/components";

export function ActiveCourseSelection({
  setDialogOpen,
}: {
  setDialogOpen: (open: boolean) => void;
}): ReactElement {
  // Course Context
  const { activeCourse } = useCourse();

  return (
    <ActiveSelectionButton
      setDialogOpen={setDialogOpen}
      activeContext={activeCourse}
      label={activeCourse?.name || "Course"}
      buttonStyle={"text-orange-400"}
    />
  );
}
