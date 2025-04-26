import { useAssignment } from "../../context/AssignmentProvider.tsx";
import { useNavigate } from "react-router-dom";
import { MouseEvent, useEffect, useState } from "react";
import { ChoiceDialog, PaletteActionButton } from "@/components";
import { useRubric } from "@/context";

interface AssignmentDataProps {
  modifyRubric: () => void;
}

export function AssignmentData({ modifyRubric }: AssignmentDataProps) {
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

  useEffect(() => {
    // default rubric in palette will use empty string for id indicating Canvas does not have an active rubric
    if (activeRubric && activeRubric.id) {
      setRubricMessage(messageOptions.present);
    } else {
      setRubricMessage(messageOptions.missing);
    }
  }, [activeRubric]);

  function handleEditRubricSelection(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    modifyRubric();
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
