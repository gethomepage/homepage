import { PiCopy, PiCpu, PiCpuFill } from "react-icons/pi";
import { MdOutlineSmartDisplay } from "react-icons/md";

export default function PlayStatusIcon({ videoDecision, audioDecision, opacity }) {
  return (
    <div className="self-center text-base flex z-10">
      {videoDecision === "direct play" && audioDecision === "direct play" && (
        <MdOutlineSmartDisplay className={opacity} />
      )}
      {videoDecision === "copy" && audioDecision === "copy" && <PiCopy className={opacity} />}
      {videoDecision !== "copy" && videoDecision !== "direct play" && <PiCpuFill className={opacity} />}
      {(videoDecision === "copy" || videoDecision === "direct play") &&
       (audioDecision !== "copy" && audioDecision !== "direct play") && <PiCpu className={opacity} />}
    </div>
  );
}
