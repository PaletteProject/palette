import { useAssignment } from "../../context/AssignmentProvider.tsx";
import { useNavigate } from "react-router-dom";
import { MouseEvent, useEffect, useState } from "react";
import { Rubric } from "palette-types";
import { ChoiceDialog } from "@components";
import { useChoiceDialog } from "../../context/DialogContext.tsx";

export function AssignmentData({ rubric }: { rubric: Rubric | undefined }) {
  const { activeAssignment } = useAssignment();
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
    if (rubric) {
      setRubricMessage(messageOptions.present);
    } else {
      setRubricMessage(messageOptions.missing);
    }
  }, [rubric]);

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
          {!rubric && (
            <button
              className={"text-cyan-400 font-bold"}
              type={"button"}
              onClick={() => navigate("/rubric-builder")}
            >
              Build Rubric
            </button>
          )}
          {rubric && (
            <button
              className={"text-green-500 font-bold"}
              type={"button"}
              onClick={handleEditRubricSelection}
            >
              Edit Rubric
            </button>
          )}
        </div>
      </div>
      <ChoiceDialog />
    </div>
  );
}
