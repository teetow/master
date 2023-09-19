import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { parseLog } from "./logparser";
import { LoudnessStats } from "./types";
import { getFileExt } from "./units";

const version = "0.12.3";
const baseUrl = "https://unpkg.com/@ffmpeg";

export const FFmpegUrls = {
  coreURL: await toBlobURL(`${baseUrl}/core@${version}/dist/esm/ffmpeg-core.js`, "text/javascript"),
  wasmURL: await toBlobURL(`${baseUrl}/core@${version}/dist/esm/ffmpeg-core.wasm`, "application/wasm"),
};

type ParamType = number | { value: string; label: string };

export type EncoderParams = {
  bitDepth: "keep" | "pcm_s16le" | "pcm_s24le" | "pcm_s32le";
  sampleRate: "keep" | string;
  target_i: number;
  target_tp: number;
};

export const EncoderParamPresets = {
  bitDepth: [
    { value: "pcm_s16le", label: "16-bit" },
    { value: "pcm_s24le", label: "24-bit" },
    { value: "pcm_s32le", label: "32-bit" },
    { value: "keep", label: "Keep" },
  ],
  sampleRate: [
    { value: "44100", label: "44100" },
    { value: "48000", label: "48000" },
    { value: "keep", label: "Keep" },
  ],
  target_i: [-14],
  target_tp: [-1],
} satisfies Record<keyof EncoderParams, ParamType[]>;

export const getOpt = (value: string, optset: { value: string; label: string }[]) => {
  return optset.find((o) => o.value === value) || { value: value, label: value };
};

type LogCallback = ({ message }: { message: string }) => void;
type ProgressCallback = ({ progress, time }: { progress: number; time: number }) => void;

export const hasLoudnessParams = (params: Partial<LoudnessStats>): params is LoudnessStats =>
  params !== undefined && "i" in params && "tp" in params && "target_i" in params && "target_tp" in params;

export const calcLoudnorm = (params: LoudnessStats) =>
  Math.min(params.target_i - params.i, params.target_tp - params.tp);

export function generateFilename(name: string, extras?: string[], ext?: string) {
  if (!ext) ext = ".wav";
  const root = name.replace(ext, "");
  return `${root}${extras?.join("")}-mastered.wav`.replace(" ", "_");
}

type RuntimeOptions = {
  onMsg?: (s: string) => void;
  onProgress?: (ratio: number) => void;
  onLogParse?: (params: Partial<LoudnessStats>) => void;
};

export const getLoudness = async (file: File, options?: RuntimeOptions) => {
  let params: Partial<LoudnessStats> = {};

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

  await ffmpeg.load(FFmpegUrls);

  options?.onMsg?.(`Loading ${file.name}...`);
  const safeFilename = file.name.replace(" ", "_");
  ffmpeg.writeFile(safeFilename, await fetchFile(file));

  await ffmpeg.exec(["-i", `${safeFilename}`, "-af", "loudnorm=print_format=json", "-f", "null", "-"]);

  return params;
};

export const applyGain = async (
  file: File,
  adjustment: number,
  options?: RuntimeOptions,
  encoderOptions?: EncoderParams
) => {
  const ext = getFileExt(file.name);

  const ffmpeg = new FFmpeg();
  await ffmpeg.load(FFmpegUrls);

  const handleProgress: ProgressCallback = ({ progress }) => options?.onProgress?.(progress);
  ffmpeg.on("progress", handleProgress);

  const safeFilename = file.name.replace(" ", "_");
  ffmpeg.writeFile(safeFilename, await fetchFile(file));

  let outFileExtras = [];

  const ffmpegArgs = ["-i", `${safeFilename}`, "-af", `volume=${adjustment}dB`];

  if (encoderOptions) {
    if (encoderOptions?.bitDepth !== "keep") {
      ffmpegArgs.push(`-acodec`, `${encoderOptions?.bitDepth}`);
      outFileExtras.push(`-${encoderOptions?.bitDepth}`);
    } else if (ext === ".mp3") {
      encoderOptions.bitDepth = "pcm_s24le";
    }

    if (encoderOptions?.sampleRate !== "keep") {
      ffmpegArgs.push(`-ar`, `${encoderOptions?.sampleRate}`);

      outFileExtras.push(`-${encoderOptions?.sampleRate}`);
    }
  }
  const outfile = generateFilename(safeFilename, outFileExtras, ext);
  ffmpegArgs.push(`${outfile}`);

  await ffmpeg.exec(ffmpegArgs);
  const audio = await ffmpeg.readFile(`${outfile}`);

  return [audio, outfile] as [Uint8Array, string];
};
