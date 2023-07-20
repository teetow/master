import type { LogCallback } from "@ffmpeg.wasm/main";
import { createFFmpeg, fetchFile } from "@ffmpeg.wasm/main";
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

export const getLoudness = async (
  file: string,
  onMsg?: (s: string) => void,
  onProgress?: (ratio: number) => void
) => {
  let params: Partial<LoudnessParams> = {};

  const logMsg: LogCallback = (logParams) => {
    params = parseLog(logParams.message, params);
    onMsg?.(logParams.message);
  };

  const ffmpeg = createFFmpeg({
    log: true,
    logger: logMsg,
    progress: ({ ratio }) => onProgress?.(ratio),
  });
  await ffmpeg.load();

  onMsg?.(`Storing ${file}...`);
  const audioFile = await fetchFile(file);
  onMsg?.(`${audioFile.length} (${audioFile.buffer.byteLength}) bytes stored.`);
  ffmpeg.FS("writeFile", file, audioFile);

  // const dir = ffmpeg.FS("readdir", "");
  // onMsg?.(`Folder contents: ${dir.join(", ")}`);

  onMsg?.("done writing.");

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

  const ffmpeg = createFFmpeg({ log: true, logger: onLog });
  await ffmpeg.load();

  const audioFile = await fetchFile(file);
  ffmpeg.FS("writeFile", file, audioFile);

  const outfile = generateFilename(file);
  await ffmpeg.run("-i", file, "-af", `volume=${adjustment}dB`, outfile);
  const audio = ffmpeg.FS("readFile", outfile);

  return audio;
};
