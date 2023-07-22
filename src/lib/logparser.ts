import { LoudnessParams } from "./ffmpeg";

type PropDef<T> = {
  trigger: string;
  parser: (s: string) => T;
};

export const parseLoudnorm = (s: string) =>
  s && /".+?" : "(?<param>.+?)"/.exec(s)?.groups?.param;

export const parseProgress = (s: string) =>
  /time=(?<time>.+?) /.exec(s)?.groups?.time;

const defs: PropDef<Partial<LoudnessParams>>[] = [
  {
    trigger: "input_i",
    parser: (s) => {
      const num = Number(parseLoudnorm(s));

      return { i: Number.isNaN(num) ? -99 : Number(parseLoudnorm(s)) };
    },
  },
  {
    trigger: "input_tp",
    parser: (s) => ({ tp: Number(parseLoudnorm(s)) }),
  },
  {
    trigger: "Stream #0:0: Audio: ",
    parser: (s) => ({
      bitdepth:
        /Audio: (?<encoding>.+), (?<srate>\d+ Hz), (?<channels>\w+), (?<bitdepth>[^,]+?), (?<bitrate>\d+ kb\/s)/.exec(
          s
        )?.groups?.encoding,
    }),
  },
];

export function parseLog(message: string, data: Partial<LoudnessParams>) {
  defs.forEach((def) => {
    if (message.includes(def.trigger)) {
      data = { ...data, ...def.parser(message) };
    }
  });

  return data;
}
