import { LoudnessParams } from "./ffmpeg";
import { Metadata } from "./metadata";

export type Job = {
  status: "new" | "invalid" | "analyzing" | "measuring" | "adjusting" | "done" | "failed";
  src?: File;
  resultUrl?: string;
  resultFilename?: string;
  progress: number;
  meta?: Metadata;
  stats: LoudnessParams;
};
