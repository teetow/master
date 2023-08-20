export type Metadata = {
  type: string;
  bitdepth: number;
  bitrate: number;
  channels: number;
  srate: number;
};

type Options = {
  onProgress?: (progress: number) => void;
};

const guessBitDepth = (file: File, buffer: AudioBuffer) => {
  if (file.type === "audio/wav") {
    return Math.round(file.size / (buffer.length * buffer.numberOfChannels)) * 8;
  }

  return 24;
};

export const analyzeFile = async (file: File, { onProgress }: Options = {}): Promise<Metadata> => {
  const audioCtx = new AudioContext();
  const data = await file.arrayBuffer();
  onProgress?.(0.2);

  return new Promise(async (resolve) => {
    onProgress?.(0.3);
    await audioCtx.decodeAudioData(data, (buffer) => {
      onProgress?.(0.8);

      resolve({
        type: file.type,
        bitdepth: guessBitDepth(file, buffer),
        bitrate: Math.round(file.size / buffer.length),
        channels: buffer.numberOfChannels,
        srate: buffer.sampleRate,
      });
    });
  });
};
