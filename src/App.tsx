import { LogCallback, createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { ConfigProvider, Typography, theme } from "antd";
import React, { useState } from "react";
import "./App.css";

// "input_i" : "-14.23",
// "input_tp" : "-0.85",
// "input_lra" : "5.50",
// "input_thresh" : "-24.40",
// "output_i" : "-23.12",
// "output_tp" : "-7.74",
// "output_lra" : "4.40",
// "output_thresh" : "-33.19",
// "normalization_type" : "dynamic",
// "target_offset" : "-0.88"

type EncoderParams = Partial<{
  progress: string;
  duration: number;
  i: number;
  tp: number;
  target_i: number;
  target_tp: number;
}>;

const parseLoudnorm = (s: string) =>
  /".+?" : "(?<param>.+?)"/.exec(s)?.groups?.param;

const parseProgress = (s: string) => /time=(?<time>.+?) /.exec(s)?.groups?.time;

function App() {
  const [audioSrc, setAudioSrc] = useState();

  const [status, setStatus] = useState("idling...");
  const [params, setParams] = useState<EncoderParams>();

  const ffmpeg = createFFmpeg({
    log: true,
  });

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async ({
    target: { files },
  }) => {
    if (files) {
      const { name } = files[0];

      setStatus("loading ffmpeg...");
      await ffmpeg.load();

      const onLog: LogCallback = (logParams) => {
        if (logParams.message.includes("input_i")) {
          setParams((prev) => ({
            ...prev,
            i: Number(parseLoudnorm(logParams.message)),
          }));
        }

        if (logParams.message.includes("input_tp")) {
          setParams((prev) => ({
            ...prev,
            tp: Number(parseLoudnorm(logParams.message)),
          }));
        }

        if (logParams.message.includes("time=")) {
          setParams((prev) => ({
            ...prev,
            progress: parseProgress(logParams.message),
          }));
        }
      };

      ffmpeg.setLogger(onLog);

      setStatus(`Storing ${name}...`);
      ffmpeg.FS("writeFile", name, await fetchFile(files[0]));

      setStatus(`Analyzing ${name}...`);
      await ffmpeg.run(
        "-i",
        name,
        "-af",
        "loudnorm=print_format=json",
        "-f",
        "null",
        "-"
      );
    }
  };

  return (
    <>
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <div className="report">
          <audio src={audioSrc}></audio>
          <input type="file" onChange={handleChange} />
          {/* <Upload accept="audio/wav" onChange={onUpload}>
          <Button icon={<UploadOutlined />}>Drop .wav here</Button>
        </Upload> */}
          <Typography.Text>{status}</Typography.Text>
          <Typography.Text>i: {params?.i}</Typography.Text>
          <Typography.Text>tp: {params?.tp}</Typography.Text>
          <Typography.Text>progress: {params?.progress}</Typography.Text>
        </div>
      </ConfigProvider>
    </>
  );
}

export default App;
