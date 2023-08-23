import { Metadata } from "./metadata";

export type LoudnessStats = {
  i: number;
  tp: number;
  target_i: number;
  target_tp: number;
  result_i: number;
  result_tp: number;
};

export type Job = {
  status: "new" | "invalid" | "analyzing" | "measuring" | "adjusting" | "done" | "failed";
  src?: File;
  resultUrl?: string;
  resultFilename?: string;
  progress: number;
  meta?: Metadata;
  stats: LoudnessStats;
};
