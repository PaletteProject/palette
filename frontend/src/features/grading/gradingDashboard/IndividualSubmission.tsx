import { Submission } from "palette-types";
import { useEffect, useState } from "react";
import { StatusIcons } from "@features";

export type SubmissionIconStatus = {
  gradedOpacity: string;
  missingOpacity: string;
  lateOpacity: string;
  commentOpacity: string;
};

/**
 * Component for displaying student submission in the group submissions view.
 */
export function IndividualSubmission({
  submission,
}: {
  submission: Submission;
}) {
  // initialize status icons to ghosted. Late icon needed a little bump for visibility.
  const [iconStatus, setIconStatus] = useState<SubmissionIconStatus>({
    gradedOpacity: "opacity-20",
    missingOpacity: "opacity-20",
    lateOpacity: "opacity-30",
    commentOpacity: "opacity-20",
  });

  const ICON_SIZE = "h-6";
  const MAX_ID_LENGTH = 8; // ASURITE Ids are 8 characters

  // set the icons based on submission status: graded | missing | late | comments
  useEffect(() => {
    setIconStatus((prev) => ({
      ...prev,
      gradedOpacity: submission.graded ? "" : "opacity-20",
      missingOpacity: submission.missing ? "" : "opacity-20",
      lateOpacity: submission.late ? "" : "opacity-30",
      commentOpacity: submission.comments.length !== 0 ? "" : "opacity-20",
    }));
  }, [submission]);

  return (
    <div
      className={
        "border border-gray-200 border-opacity-50 px-4 py-3 rounded-xl flex  justify-between items-center" +
        " cursor-pointer hover:border-opacity-100 shadow-2xl gap-6"
      }
    >
      <div className={"flex flex-col items-start gap-2 text-xl font-semibold"}>
        <p>
          {submission.user.asurite.length > MAX_ID_LENGTH
            ? submission.user.asurite.slice(0, MAX_ID_LENGTH) + "..."
            : submission.user.asurite}
        </p>
        {/*Only display first name on smaller screens*/}
        <p className={"font-light block lg:hidden"}>
          {submission.user.name.split(/ /)[0]}
        </p>
        <p className={"font-light hidden lg:block "}>{submission.user.name}</p>
      </div>
      <StatusIcons
        iconStatus={iconStatus}
        iconSize={ICON_SIZE}
        visibility={"grid gap-1 lg:flex"}
      />
    </div>
  );
}
