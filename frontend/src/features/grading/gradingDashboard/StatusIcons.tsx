import { SubmissionIconStatus } from "@features";

export function StatusIcons({
  iconStatus,
  iconSize,
  visibility,
}: {
  iconStatus: SubmissionIconStatus;
  iconSize: string;
  visibility: string;
}) {
  return (
    // vis set to grid layout or hidden
    <div className={`gap-3 bg-gray-900 p-2 rounded-2xl ${visibility}`}>
      <img
        src="/check-icon.png"
        alt="Assignment Graded"
        className={`${iconSize} ${iconStatus.gradedOpacity}`}
        title="Assignment Graded"
      />

      <img
        src="/timer-purple.png"
        alt="Assignment Submitted Late"
        className={`${iconSize} ${iconStatus.lateOpacity}`}
        title="Late"
      />
      <img
        src="/comment-icon.png"
        alt="Comments Added"
        className={`${iconSize} ${iconStatus.commentOpacity}`}
        title="Comments"
      />
      <img
        src="/close-icon.png"
        alt="Assignment Submission Missing"
        className={`${iconSize} ${iconStatus.missingOpacity}`}
        title="Missing"
      />
    </div>
  );
}
