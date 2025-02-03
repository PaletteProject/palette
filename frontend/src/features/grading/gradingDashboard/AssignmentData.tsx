import { useAssignment } from "../../../context/AssignmentProvider.tsx";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Rubric } from "palette-types";

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

  useEffect(() => {
    if (rubric) {
      setRubricMessage(messageOptions.present);
    } else {
      setRubricMessage(messageOptions.missing);
    }
  }, [rubric]);

  return (
    <div className={"flex px-4 min-w-screen justify-between items-center"}>
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
              onClick={() => navigate("/rubric-builder")}
            >
              Edit Rubric
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
