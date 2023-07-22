import { UploadOutlined } from "@ant-design/icons";

import cx from "classix";
import { ConfigProvider, UploadProps, theme } from "antd";
import type { RcFile } from "antd/es/upload";
import Dragger from "antd/es/upload/Dragger";
import { CSSProperties, useEffect, useRef, useState } from "react";
import "./App.css";
import { useLogger } from "./hooks/useLogger";
import {
  LoudnessParams,
  applyGain,
  calcLoudnorm,
  getLoudness,
  hasLoudnessParams,
} from "./lib/ffmpeg";

import WaveSurfer from "wavesurfer.js";
import { fetchFile } from "@ffmpeg.wasm/main";

const defaultParams = {
  i: -18,
  tp: -3,
  target_i: -14,
  target_tp: -1,
};

function App() {
  const [audioSrc, setAudioSrc] = useState("");
  const [stats, setStats] = useState<Partial<LoudnessParams>>();
  const [progress, setProgress] = useState<number>(-1);
  const [log, logMsg, clearLog] = useLogger();

  const wavesurferRef = useRef<WaveSurfer>();
  const visualizerRef = useRef<HTMLDivElement>(null);

  const colorDiff = (value: number, reference: number) => {
    const diff = value - reference;
    return (
      <span
        className={cx(
          "diff",
          diff >= 0.1
            ? "over"
            : diff >= -0.1
            ? "at"
            : diff >= -6
            ? "under"
            : "wayunder"
        )}
      >
        {value}
      </span>
    );
  };

  const handleUpload = async (file: RcFile) => {
    console.log("🚀🚀🚀🚀🚀🚀🚀🚀🚀");
    if (file === undefined) {
      return;
    }

    clearLog();

    const audioCtx = new AudioContext();
    await audioCtx.decodeAudioData(await file.arrayBuffer(), (props) => {
      setStats((prev) => ({
        ...prev,
        ...{
          bitdepth: file.type,
          bitrate: `${Math.round(file.size / props.length)} kB/s`,
          srate: `${props.sampleRate} Hz`,
          channels: props.numberOfChannels == 1 ? "mono" : "stereo",
        },
      }));
    });

    const cmdOptions = {
      onMsg: logMsg,
      onProgress: (ratio) => setProgress(ratio),
      onLogParse: (params: Partial<LoudnessParams>) =>
        setStats((prev) => ({ ...prev, ...params })),
    } as Parameters<typeof getLoudness>[1];

    const loudness = {
      ...defaultParams,
      ...(await getLoudness(file, cmdOptions)),
    };

    if (!hasLoudnessParams(loudness)) {
      logMsg(`Couldn't get proper values. ${JSON.stringify(loudness)}`);
      return;
    }

    const adjustment = calcLoudnorm(loudness as LoudnessParams);

    let audio: Uint8Array;
    let outfile: string;

    if (Math.abs(adjustment) < 0.01) {
      logMsg(`${file.name} is already normalized.`);
      audio = await fetchFile(file);
      const audioUrl = URL.createObjectURL(
        new Blob([audio.buffer], { type: "audio/wav" })
      );
      setAudioSrc(audioUrl);
    } else {
      setStats((prev) => ({
        ...prev,
        ...{
          result_i: Number((loudness.i + adjustment).toFixed(2)),
          result_tp: Number((loudness.tp + adjustment).toFixed(2)),
        },
      }));

      logMsg(`Applying ${adjustment.toFixed(2)} dB gain to ${file.name}...`);
      [audio, outfile] = await applyGain(file, adjustment);

      const audioUrl = URL.createObjectURL(
        new Blob([audio.buffer], { type: "audio/wav" })
      );
      setAudioSrc(audioUrl);

      logMsg(<a href={audioUrl} download={outfile}>{`Download ${outfile}`}</a>);
    }
  };

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    accept: "audio/wav",
    // showUploadList: false,
    customRequest: async ({ onSuccess }) => {
      onSuccess?.("ok");
    },
    async onChange(info) {
      const { status } = info.file;
      if (status === "error") {
        logMsg("Failed to upload. Sorry =(");
        return;
      }
    },
    async onDrop(e) {
      await handleUpload(e.dataTransfer.files[0] as RcFile);
    },
  };

  useEffect(() => {
    if (!wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: visualizerRef.current!,
        waveColor: "hsl(214, 40%, 40%)",
        progressColor: "hsl(214, 30%, 60%)",
      });
      wavesurferRef.current.on(
        "interaction",
        () => wavesurferRef.current?.play
      );
    }

    const loadUrl = async (url: string) => {
      await wavesurferRef.current?.load(url);
      // await wavesurferRef.current?.play();
    };
    if (audioSrc) {
      loadUrl(audioSrc);
    }
  }, [wavesurferRef, audioSrc]);

  return (
    <>
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <div
          className="master"
          style={{ minHeight: "32rem", minWidth: "28rem" }}
        >
          {!audioSrc && (
            <Dragger {...uploadProps} className="upload">
              <UploadOutlined />
              <p>Drop .wav here</p>
            </Dragger>
          )}
          <div
            className={cx("wavesurfer", audioSrc !== "" && "has-audio")}
            ref={visualizerRef}
          />
          {
            <div className="stats">
              {stats?.srate && (
                <span className="box srate">{stats?.srate}</span>
              )}
              {stats?.bitdepth && (
                <span className="box bitdepth">{stats?.bitdepth}</span>
              )}
              {stats?.channels && (
                <span className="box channels">{stats?.channels}</span>
              )}
              {stats?.i && (
                <span className="box i">
                  <span className="info">I</span>
                  <span className="i">
                    {colorDiff(
                      stats.i,
                      stats.target_i || defaultParams.target_i
                    )}{" "}
                    dB
                  </span>
                  {stats.result_i && (
                    <span className="result_i">
                      ▶{" "}
                      {colorDiff(
                        stats.result_i,
                        stats.target_i || defaultParams.target_i
                      )}{" "}
                      dB
                    </span>
                  )}
                </span>
              )}
              {stats?.tp && (
                <span className="box tp">
                  <span className="info">TP</span>
                  <span className="tp">
                    {colorDiff(
                      stats.tp,
                      stats.target_tp || defaultParams.target_tp
                    )}{" "}
                    dB
                  </span>
                  {stats.result_tp && (
                    <span className="result_tp">
                      ▶{" "}
                      {colorDiff(
                        stats.result_tp,
                        stats.target_tp || defaultParams.target_tp
                      )}{" "}
                      dB
                    </span>
                  )}
                </span>
              )}
            </div>
          }

          <div className="logger">
            {progress < 1 && (
              <div
                className={["progress", progress > -1 ? "visible" : ""].join(
                  " "
                )}
                {...{ style: { "--progress": progress } as CSSProperties }}
              />
            )}
            <label>{log[log.length - 1]}</label>
            <ul className="history">
              {[...log]
                .reverse()
                .slice(1)
                .map((line, index) => (
                  <li key={`${index}-${line}`}>{line}</li>
                ))}
            </ul>
          </div>
        </div>
      </ConfigProvider>
    </>
  );
}

export default App;
