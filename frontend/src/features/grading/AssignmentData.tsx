import { useAssignment } from "../../context/AssignmentProvider.tsx";
import { useNavigate } from "react-router-dom";
import { MouseEvent, useEffect, useState } from "react";
import { ChoiceDialog, PaletteActionButton } from "@components";
import { useChoiceDialog } from "../../context/DialogContext.tsx";
import { useRubric } from "@context";

export function AssignmentData() {
  const { activeAssignment } = useAssignment();
  const { activeRubric } = useRubric();
  const navigate = useNavigate();

  const messageOptions = {
    missing: "This assignment does not have an associated rubric: ",
    present: `This assignment has an associated rubric: `,
  };

  const [rubricMessage, setRubricMessage] = useState<string>(
    messageOptions.missing,
  );

  const { openDialog, closeDialog } = useChoiceDialog();

  useEffect(() => {
    if (activeRubric) {
      setRubricMessage(messageOptions.present);
    } else {
      setRubricMessage(messageOptions.missing);
    }
  }, [activeRubric]);

  function handleEditRubricSelection(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    openDialog({
      title: "Warning: Partial Data Loss Possible",
      message:
        "When an assignment rubric changes, Canvas preserves the existing score but overwrites the rubric" +
        " assessment entirely. The application will show accurate grading progress, however rating options will all" +
        " be" +
        " reset in the grading view.",
      buttons: [
        {
          label: "I accept this risk",
          autoFocus: false,
          action: () => navigate("/rubric-builder"),
          color: "RED",
        },
        {
          label: "Back to safety",
          autoFocus: true,
          color: "BLUE",
          action: () => closeDialog(),
        },
      ],
      excludeCancel: true,
    });
  }

  return (
    <div className={"flex min-w-screen justify-between items-center"}>
      <div className={"grid gap-3"}>
        <p className={"font-bold text-3xl"}>
          <span className={"font-medium"}>Assignment: </span>
          {activeAssignment!.name}
        </p>
        <div className={"flex gap-4"}>
          <div
            className={"bg-gray-500 rounded-lg px-2 py-1 shadow-2xl flex gap-2"}
          >
            {" "}
            {rubricMessage}{" "}
          </div>
          {!activeRubric && (
            <PaletteActionButton
              onClick={() => {
                navigate("/rubric-builder");
              }}
              title={"Build Rubric"}
              color={"YELLOW"}
            />
          )}
          {activeRubric && (
            <PaletteActionButton
              onClick={handleEditRubricSelection}
              title={"Edit Rubric"}
              color={"PURPLE"}
            />
          )}
        </div>
      </div>
      <ChoiceDialog />
    </div>
  );
}
