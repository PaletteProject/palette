/**
 * Component to prompt the user to select an assignment before they're able to build a rubric.
 * @constructor
 */

import {
  AssignmentSelectionMenu,
  Dialog,
  PaletteActionButton,
} from "@components";
import { useState } from "react";

export function NoAssignmentSelected() {
  const [assignmentMenuOpen, setAssignmentMenuOpen] = useState(false);

  return (
    <div className="text-5xl font-semibold self-center justify-self-center mt-10">
      <PaletteActionButton
        color={"GREEN"}
        title={"Select an Assignment"}
        onClick={() => setAssignmentMenuOpen(true)}
      />
      <Dialog
        isOpen={assignmentMenuOpen}
        onClose={() => setAssignmentMenuOpen(false)}
        title={"Assignment Selection"}
      >
        <AssignmentSelectionMenu onSelect={setAssignmentMenuOpen} />
      </Dialog>
    </div>
  );
}
