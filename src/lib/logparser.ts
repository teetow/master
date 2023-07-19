import { EncoderParams } from "./ffmpeg";

type PropDef<T> = {
  trigger: string;
  parser: (s: string) => T;
};

export const parseLoudnorm = (s: string) =>
  s && /".+?" : "(?<param>.+?)"/.exec(s)?.groups?.param;

export const parseProgress = (s: string) =>
  /time=(?<time>.+?) /.exec(s)?.groups?.time;

const defs: PropDef<Partial<EncoderParams>>[] = [
  {
    trigger: "input_i",
    parser: (s) => ({ i: Number(parseLoudnorm(s)) }),
  },
  {
    trigger: "input_tp",
    parser: (s) => ({ tp: Number(parseLoudnorm(s)) }),
  },
  {
    trigger: "time=",
    parser: (s) => ({ progress: parseProgress(s) }),
  },
];

export function parseLog(message: string, data: Partial<EncoderParams>) {
  defs.forEach((def) => {
    if (message.includes(def.trigger)) {
      data = { ...data, ...def.parser(message) };
    }
  });

  return data;
}
