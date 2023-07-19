import { LogCallback, createFFmpeg, fetchFile } from "@ffmpeg.wasm/main";
import { UploadOutlined } from "@ant-design/icons";
import {
  Button,
  ConfigProvider,
  Typography,
  Upload,
  UploadProps,
  theme,
} from "antd";
import { RcFile } from "antd/es/upload";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import { useLogger } from "./hooks/useLogger";
import { useMatcher } from "./hooks/useMatcher";

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

type EncoderParams = {
  progress: string;
  duration: number;
  i: number;
  tp: number;
  target_i: number;
  target_tp: number;
};

const parseLoudnorm = (s: string) =>
  s && /".+?" : "(?<param>.+?)"/.exec(s)?.groups?.param;

const parseProgress = (s: string) => /time=(?<time>.+?) /.exec(s)?.groups?.time;

type LoudnessParams = Pick<
  EncoderParams,
  "i" | "tp" | "target_i" | "target_tp"
>;

const hasLoudnessParams = (
  params: Partial<LoudnessParams>
): params is LoudnessParams =>
  params !== undefined &&
  "i" in params &&
  "tp" in params &&
  "target_i" in params &&
  "target_tp" in params;

const calcLoudnorm = (params: LoudnessParams) =>
  Math.min(params.target_i - params.i, params.target_tp - params.tp);

function generateFilename(name: string) {
  const root = name.replace(".wav", "");
  return `${root}-mastered.wav`;
}

function App() {
  const [audioSrc, setAudioSrc] = useState("");

  const [log, logMsg] = useLogger();
  const [params, updateParams] = useMatcher<Partial<EncoderParams>>([
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
  ]);

  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const onLog: LogCallback = (logParams) => {
    if (logParams?.message?.includes("FFMPEG_END")) {
      logMsg("Done analyzing.");
    }
    logMsg(logParams.message);
    updateParams(logParams.message);
  };

  const handleUpload = async (file: RcFile) => {
    if (file === undefined) {
      return;
    }

    const { name } = file;

    let ffmpeg = createFFmpeg({
      log: true,
      logger: onLog,
    });

    logMsg("loading ffmpeg...");
    await ffmpeg.load();

    logMsg(`Storing ${name}...`);
    const audioFile = await fetchFile(file);
    ffmpeg.FS("writeFile", name, audioFile);

    logMsg(`Analyzing ${name}...`);

    await ffmpeg.run(
      "-i",
      name,
      "-af",
      "loudnorm=print_format=json",
      "-f",
      "null",
      "-"
    );
    
    logMsg("Initiating second pass...");
    await ffmpeg.exit();
    ffmpeg = createFFmpeg({ log: true, logger: onLog });
    await ffmpeg.load();
    ffmpeg.FS("writeFile", name, audioFile);

    const currentParams = {
      i: -18,
      tp: -3,
      ...paramsRef.current,
      target_i: -14,
      target_tp: -1,
    };

    if (!hasLoudnessParams(currentParams)) {
      logMsg(`Couldn't get proper values. ${JSON.stringify(currentParams)}`);
      return;
    }
    const adj = calcLoudnorm(currentParams as LoudnessParams);

    logMsg(
      `Adjusting volume by ${adj} dB (I: ${currentParams.i + adj} TP: ${
        currentParams.tp + adj
      })`
    );

    const outfile = generateFilename(name);

    logMsg(`Output filename: ${outfile}`);

    await ffmpeg.run(
      "-i",
      name,
      // "-threads",
      // "256",
      "-af",
      `volume=${adj}dB`,
      outfile
    );

    const audio = ffmpeg.FS("readFile", outfile);

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
    customRequest: ({ file, onSuccess }) => {
      handleUpload(file as RcFile);
      onSuccess?.("ok");
    },
    onChange(info) {
      const { status, name } = info.file;
      if (status === "uploading") {
        logMsg(`Uploading ${name}...`);
      }
      if (status === "done") {
        logMsg(`Done uploading ${name}`);
      }
      if (status === "error") {
        logMsg("Failed to upload. Sorry =(");
        return;
      }
    },
    onDrop(e) {},
  };

  return (
    <>
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <div className="report">
          <audio controls src={audioSrc} />
          {/* <input type="file" onChange={handleChange} /> */}
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
          <Typography.Text>progress: {params?.progress}</Typography.Text>
        </div>
      </ConfigProvider>
    </>
  );
}

export default App;
