import { useEffect, useState } from "react";

export type Meta = {
  bitdepth: string;
  bitrate: string;
  channels: string;
  srate: string;
};

export default function useFileMeta() {
  const [meta, setMeta] = useState<Partial<Meta>>({});
  const [audioFile, setAudioFile] = useState<File>();

  const updateMeta = async (file: File) => {
    const audioCtx = new AudioContext();
    const buffer = await file.arrayBuffer();

    await audioCtx.decodeAudioData(buffer, (props) => {
      setMeta((prev) => ({
        ...prev,
        ...{
          bitdepth: file.type,
          bitrate: `${Math.round(file.size / props.length)} kB/s`,
          channels: props.numberOfChannels == 1 ? "mono" : "stereo",
          srate: `${props.sampleRate} Hz`,
        },
      }));
    });
  };

  useEffect(() => {
    if (audioFile) {
      updateMeta(audioFile);
    }
  }, [audioFile]);

  return [meta, setAudioFile] as [typeof meta, typeof setAudioFile];
}
