import type { LogCallback } from "@ffmpeg.wasm/main";
import { createFFmpeg } from "@ffmpeg.wasm/main";
import { parseLog } from "./logparser";

export type EncoderParams = {
  progress: string;
  duration: number;
  i: number;
  tp: number;
  target_i: number;
  target_tp: number;
};

export type LoudnessParams = Pick<
  EncoderParams,
  "i" | "tp" | "target_i" | "target_tp"
>;

export const hasLoudnessParams = (
  params: Partial<LoudnessParams>
): params is LoudnessParams =>
  params !== undefined &&
  "i" in params &&
  "tp" in params &&
  "target_i" in params &&
  "target_tp" in params;

export const calcLoudnorm = (params: LoudnessParams) =>
  Math.min(params.target_i - params.i, params.target_tp - params.tp);

export function generateFilename(name: string) {
  const root = name.replace(".wav", "");
  return `${root}-mastered.wav`;
}

export const calcLoudness = async (
  file: string,
  onMsg: (s: string) => void
) => {
  let params: Partial<EncoderParams> = {};

  const onLog: LogCallback = (logParams) => {
    params = parseLog(logParams.message, params);
    onMsg(logParams.message);
  };

  const ffmpeg = createFFmpeg({ log: true, logger: onLog });

  await ffmpeg.run(
    "-i",
    file,
    "-af",
    "loudnorm=print_format=json",
    "-f",
    "null",
    "-"
  );

  return params;
};

export const applyGain = async (
  file: string,
  adjustment: number,
  onMsg: (s: string) => void
) => {
  const onLog: LogCallback = (logParams) => {
    onMsg(logParams.message);
  };

  const outfile = generateFilename(file);

  const ffmpeg = createFFmpeg({ log: true, logger: onLog });
  await ffmpeg.run("-i", file, "-af", `volume=${adjustment}dB`, outfile);
};
