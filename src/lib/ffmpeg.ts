import type { LogCallback } from "@ffmpeg.wasm/main";
import { createFFmpeg, fetchFile } from "@ffmpeg.wasm/main";
import type { RcFile } from "antd/es/upload";
import { parseLog } from "./logparser";

export type LoudnessParams = {
  i: number;
  tp: number;
  target_i: number;
  target_tp: number;
  result_i: number;
  result_tp: number;
  srate: string;
  channels: string;
  bitdepth: string;
  bitrate: string;
};

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
  return `${root}-mastered.wav`.replace(" ", "_");
}

export const getLoudness = async (
  file: RcFile,
  options: {
    onMsg?: (s: string) => void;
    onProgress?: (ratio: number) => void;
    onLogParse?: (params: Partial<LoudnessParams>) => void;
  }
) => {
  let { onMsg, onProgress, onLogParse } = options;
  let params: Partial<LoudnessParams> = {};

  const handleLog: LogCallback = (logParams) => {
    params = parseLog(logParams.message, params);
    onLogParse?.(params);
  };

  const ffmpeg = createFFmpeg({
    log: true,
    logger: handleLog,
    progress: ({ ratio }) => onProgress?.(ratio),
  });
  await ffmpeg.load();

  onMsg?.(`Loading ${file.name}...`);
  const audioData = await fetchFile(file);
  const safeFilename = file.name.replace(" ", "_");

  onMsg?.(`${audioData.length} (${audioData.buffer.byteLength}) bytes loaded.`);
  ffmpeg.FS("writeFile", safeFilename, audioData);

  onMsg?.(`Analyzing ${safeFilename}...`);
  await ffmpeg.run(
    "-i",
    `${safeFilename}`,
    "-af",
    "loudnorm=print_format=json",
    "-f",
    "null",
    "-"
  );

  return params;
};

export const applyGain = async (file: RcFile, adjustment: number) => {
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

  const audioFile = await fetchFile(file);
  const safeFilename = file.name.replace(" ", "_");
  ffmpeg.FS("writeFile", safeFilename, audioFile);

  const outfile = generateFilename(safeFilename);
  await ffmpeg.run(
    "-i",
    `${safeFilename}`,
    "-af",
    `volume=${adjustment}dB`,
    `${outfile}`
  );
  const audio = ffmpeg.FS("readFile", `${outfile}`);

  return [audio, outfile] as [Uint8Array, string];
};
