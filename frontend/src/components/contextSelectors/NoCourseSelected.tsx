/**
 * Component to prompt the user to select a course before they're able to build a rubric.
 * @constructor
 */
import { useState } from "react";
import { CourseSelectionMenu, Dialog } from "@components";

export function NoCourseSelected() {
  const [courseMenuOpen, setCourseMenuOpen] = useState(false);

  return (
    <div className="text-5xl font-semibold self-center justify-self-center">
      <p>
        Select a{" "}
        <button
          className={"text-orange-400 hover:animate-pulse"}
          type={"button"}
          onClick={() => setCourseMenuOpen(true)}
        >
          Course
        </button>
      </p>
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
