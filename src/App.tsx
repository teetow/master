import { UploadOutlined } from "@ant-design/icons";
import {
  Button,
  ConfigProvider,
  Typography,
  Upload,
  UploadProps,
  theme,
} from "antd";
import type { RcFile } from "antd/es/upload";
import { useState } from "react";
import "./App.css";
import { useLogger } from "./hooks/useLogger";
import {
  LoudnessParams,
  applyGain,
  calcLoudnorm,
  getLoudness,
  hasLoudnessParams,
} from "./lib/ffmpeg";

const defaultParams = {
  i: -18,
  tp: -3,
  target_i: -14,
  target_tp: -1,
};

function App() {
  const [audioSrc, setAudioSrc] = useState("");
  const [params, setParams] = useState<LoudnessParams>(defaultParams);
  const [progress, setProgress] = useState<number>(-1);
  const [log, logMsg] = useLogger();

  const onProgress = (ratio: number) => setProgress(ratio);

  const handleUpload = async (filename: string) => {
    if (filename === undefined) {
      return;
    }

    // const { name } = file;
    const params = await getLoudness(filename, logMsg, onProgress);

    setParams({ ...defaultParams, ...params });
    const adjustment = calcLoudnorm(params as LoudnessParams);

    logMsg("Initiating second pass...");

    if (!hasLoudnessParams(params)) {
      logMsg(`Couldn't get proper values. ${JSON.stringify(params)}`);
      return;
    }
    logMsg(
      `Adjusting volume by ${adjustment} dB (I: ${params.i + adjustment} TP: ${
        params.tp + adjustment
      })`
    );
    const audio = await applyGain(filename, adjustment, logMsg);

    const audioUrl = URL.createObjectURL(
      new Blob([audio.buffer], { type: "audio/wav" })
    );

    logMsg(`URL is ${audioUrl}`);
    setAudioSrc(audioUrl);
  };

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    accept: "audio/wav",
    customRequest: async ({ file, onSuccess }) => {
      logMsg(`handling request for ${file}`);
      // await handleUpload(file as RcFile);
      onSuccess?.("ok");
    },
    async onChange(info) {
      const { status, name } = info.file;
      if (status === "uploading") {
        logMsg(`Uploading ${name}...`);
      }
      if (status === "done") {
        logMsg(`Done uploading ${name}`);
        handleUpload(name);
      }
      if (status === "error") {
        logMsg("Failed to upload. Sorry =(");
        return;
      }
    },
    onDrop(e) {
      logMsg(`dropped ${e.dataTransfer.files}`);
    },
  };

  // const visualize = () => {
  //   const wavesurfer = WaveSurfer.create({
  //     container: "#waveform",
  //     waveColor: "#4F4A85",
  //     progressColor: "#383351",
  //     url: "/audio.mp3",
  //   });
  // };

  return (
    <>
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <div className="report">
          <audio controls src={audioSrc} />

          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Drop .wav here</Button>
          </Upload>

          <Typography.Text>
            <ul>
              {log.map((line, index) => (
                <li key={`${index}-${line}`}>{line}</li>
              ))}
            </ul>
          </Typography.Text>

          <Typography.Text>i: {params?.i}</Typography.Text>
          <Typography.Text>tp: {params?.tp}</Typography.Text>
          <Typography.Text>progress: {progress}</Typography.Text>
        </div>
      </ConfigProvider>
    </>
  );
}

export default App;
