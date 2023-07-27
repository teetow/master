import { LoudnessParams } from "./ffmpeg";
import { Meta } from "./metadata";

export type Job = {
  status: "new" | "invalid" | "analyzing" | "measuring" | "adjusting" | "done" | "failed";
  src?: File;
  resultUrl?: string;
  resultFilename?: string;
  progress: number;
  meta?: Meta;
  stats: Partial<LoudnessParams>;
};
