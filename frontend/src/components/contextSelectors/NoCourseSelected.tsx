/**
 * Component to prompt the user to select a course before they're able to build a rubric.
 * @constructor
 */
import { useState } from "react";
import { CourseSelectionMenu, Dialog, PaletteActionButton } from "@components";

export function NoCourseSelected() {
  const [courseMenuOpen, setCourseMenuOpen] = useState(false);

  return (
    <div className="text-5xl font-semibold self-center justify-self-center">
      <PaletteActionButton
        color={"YELLOW"}
        title={"Select a Course"}
        onClick={() => setCourseMenuOpen(true)}
      />
      <Dialog
        isOpen={courseMenuOpen}
        onClose={() => setCourseMenuOpen(false)}
        title={"Course Selection"}
      >
        <CourseSelectionMenu onSelect={setCourseMenuOpen} />
      </Dialog>
    </div>
  );
}
