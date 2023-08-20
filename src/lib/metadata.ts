export type Metadata = {
  type: string;
  bitdepth: number;
  bitrate: number;
  channels: number;
  srate: number;
};

export const analyzeFile = async (file: File): Promise<Metadata> => {
  const audioCtx = new AudioContext();
  const buffer = await file.arrayBuffer();

  return new Promise(async (resolve) => {
    await audioCtx.decodeAudioData(buffer, (props) => {
      console.log(file.type);
      resolve({
        type: file.type,
        bitdepth: Math.round(file.size / (props.length * props.numberOfChannels)) * 8,
        bitrate: Math.round(file.size / props.length),
        channels: props.numberOfChannels,
        srate: props.sampleRate,
      });
    });
  });
};
