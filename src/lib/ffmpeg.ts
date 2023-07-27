import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { parseLog } from "./logparser";

export type LoudnessParams = {
  i: number;
  tp: number;
  target_i: number;
  target_tp: number;
};

type LogCallback = ({ message }: { message: string }) => void;
type ProgressCallback = ({ progress, time }: { progress: number; time: number }) => void;

export const hasLoudnessParams = (params: Partial<LoudnessParams>): params is LoudnessParams =>
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

const baseUrl = "https://unpkg.com/@ffmpeg/core@0.12.1/dist/umd";

type RuntimeOptions = {
  onMsg?: (s: string) => void;
  onProgress?: (ratio: number) => void;
  onLogParse?: (params: Partial<LoudnessParams>) => void;
};

export const getLoudness = async (file: File, options?: RuntimeOptions) => {
  let params: Partial<LoudnessParams> = {};

  const ffmpeg = new FFmpeg();

  const handleLog: LogCallback = ({ message }) => {
    params = parseLog(message, params);
    options?.onLogParse?.(params);
    console.log(message);
  };

  const handleProgress: ProgressCallback = ({ progress }) => {
    options?.onProgress?.(progress);
  };

  ffmpeg.on("log", handleLog);
  ffmpeg.on("progress", handleProgress);

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseUrl}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseUrl}/ffmpeg-core.wasm`, "application/wasm"),
  });

  options?.onMsg?.(`Loading ${file.name}...`);
  const safeFilename = file.name.replace(" ", "_");
  // const file = fetchFile(file);
  ffmpeg.writeFile(safeFilename, await fetchFile(file));

  await ffmpeg.exec([
    "-i",
    `${safeFilename}`,
    "-af",
    "loudnorm=print_format=json",
    "-f",
    "null",
    "-",
  ]);

  return params;
};

export const applyGain = async (file: File, adjustment: number, options?: RuntimeOptions) => {
  const ffmpeg = new FFmpeg();
  await ffmpeg.load();

  const handleProgress: ProgressCallback = ({ progress }) => options?.onProgress?.(progress);
  ffmpeg.on("progress", handleProgress);

  const safeFilename = file.name.replace(" ", "_");
  ffmpeg.writeFile(safeFilename, await fetchFile(file));

  const outfile = generateFilename(safeFilename);
  await ffmpeg.exec(["-i", `${safeFilename}`, "-af", `volume=${adjustment}dB`, `${outfile}`]);
  const audio = await ffmpeg.readFile(`${outfile}`);

  return [audio, outfile] as [Uint8Array, string];
};
