import { useAssignment } from "@/context";
import { ReactElement } from "react";
import { ActiveSelectionButton } from "@/components";

export function ActiveAssignmentSelection({
  setDialogOpen,
}: {
  setDialogOpen: (open: boolean) => void;
}): ReactElement {
  // Assignment Context
  const { activeAssignment } = useAssignment();

  return (
    <ActiveSelectionButton
      setDialogOpen={setDialogOpen}
      activeContext={activeAssignment}
      label={activeAssignment?.name || "Assignment"}
      buttonStyle="font-bold text-green-400"
    />
  );
}
