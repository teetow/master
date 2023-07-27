export type Meta = {
  bitdepth: string;
  bitrate: string;
  channels: string;
  srate: string;
};

export const analyzeFile = async (file: File): Promise<Meta> => {
  const audioCtx = new AudioContext();
  const buffer = await file.arrayBuffer();

  return new Promise(async (resolve) => {
    await audioCtx.decodeAudioData(buffer, (props) => {
      resolve({
        bitdepth: file.type,
        bitrate: `${Math.round(file.size / props.length)} kB/s`,
        channels: props.numberOfChannels == 1 ? "mono" : "stereo",
        srate: `${props.sampleRate} Hz`,
      });
    });
  });
};
