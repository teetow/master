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
        <p>
          All processing is done in your browser. Nothing is uploaded. May
          contain nuts.
        </p>
        <p>
          <div className="socialbox">
            <a href="github.com/teetow/master">
              <svg
                viewBox="0 0 256 256"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid"
                role="img"
                className="footericon"
              >
                <path d="M128.001 0C57.317 0 0 57.307 0 128.001c0 56.554 36.676 104.535 87.535 121.46 6.397 1.185 8.746-2.777 8.746-6.158 0-3.052-.12-13.135-.174-23.83-35.61 7.742-43.124-15.103-43.124-15.103-5.823-14.795-14.213-18.73-14.213-18.73-11.613-7.944.876-7.78.876-7.78 12.853.902 19.621 13.19 19.621 13.19 11.417 19.568 29.945 13.911 37.249 10.64 1.149-8.272 4.466-13.92 8.127-17.116-28.431-3.236-58.318-14.212-58.318-63.258 0-13.975 5-25.394 13.188-34.358-1.329-3.224-5.71-16.242 1.24-33.874 0 0 10.749-3.44 35.21 13.121 10.21-2.836 21.16-4.258 32.038-4.307 10.878.049 21.837 1.47 32.066 4.307 24.431-16.56 35.165-13.12 35.165-13.12 6.967 17.63 2.584 30.65 1.255 33.873 8.207 8.964 13.173 20.383 13.173 34.358 0 49.163-29.944 59.988-58.447 63.157 4.591 3.972 8.682 11.762 8.682 23.704 0 17.126-.148 30.91-.148 35.126 0 3.407 2.304 7.398 8.792 6.14C219.37 232.5 256 184.537 256 128.002 256 57.307 198.691 0 128.001 0Zm-80.06 182.34c-.282.636-1.283.827-2.194.39-.929-.417-1.45-1.284-1.15-1.922.276-.655 1.279-.838 2.205-.399.93.418 1.46 1.293 1.139 1.931Zm6.296 5.618c-.61.566-1.804.303-2.614-.591-.837-.892-.994-2.086-.375-2.66.63-.566 1.787-.301 2.626.591.838.903 1 2.088.363 2.66Zm4.32 7.188c-.785.545-2.067.034-2.86-1.104-.784-1.138-.784-2.503.017-3.05.795-.547 2.058-.055 2.861 1.075.782 1.157.782 2.522-.019 3.08Zm7.304 8.325c-.701.774-2.196.566-3.29-.49-1.119-1.032-1.43-2.496-.726-3.27.71-.776 2.213-.558 3.315.49 1.11 1.03 1.45 2.505.701 3.27Zm9.442 2.81c-.31 1.003-1.75 1.459-3.199 1.033-1.448-.439-2.395-1.613-2.103-2.626.301-1.01 1.747-1.484 3.207-1.028 1.446.436 2.396 1.602 2.095 2.622Zm10.744 1.193c.036 1.055-1.193 1.93-2.715 1.95-1.53.034-2.769-.82-2.786-1.86 0-1.065 1.202-1.932 2.733-1.958 1.522-.03 2.768.818 2.768 1.868Zm10.555-.405c.182 1.03-.875 2.088-2.387 2.37-1.485.271-2.861-.365-3.05-1.386-.184-1.056.893-2.114 2.376-2.387 1.514-.263 2.868.356 3.061 1.403Z"></path>
              </svg>
              <span>teetow/master</span>
            </a>

            <a href="soundcloud.com/teetow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 208.952 1100 581.696"
                role="img"
                className="footericon"
              >
                <path d="M0 686.216c0 13.014 4.718 22.854 14.152 29.524 9.435 6.669 19.52 9.027 30.256 7.076 10.085-1.952 17.161-5.531 21.229-10.736 4.066-5.205 6.1-13.827 6.1-25.864v-141.52c0-10.086-3.497-18.626-10.492-25.62-6.994-6.995-15.534-10.492-25.62-10.492-9.76 0-18.137 3.497-25.132 10.492C3.498 526.07 0 534.61 0 544.696v141.52zm112.24 60.512c0 9.436 3.335 16.511 10.004 21.229 6.67 4.718 15.21 7.076 25.62 7.076 10.736 0 19.438-2.359 26.108-7.076 6.669-4.717 10.004-11.793 10.004-21.229V416.84c0-9.76-3.498-18.138-10.492-25.132-6.995-6.994-15.535-10.492-25.62-10.492-9.76 0-18.138 3.498-25.132 10.492-6.995 6.995-10.492 15.372-10.492 25.132v329.888zm111.752 15.616c0 9.435 3.416 16.511 10.248 21.229 6.832 4.717 15.616 7.076 26.353 7.076 10.41 0 18.95-2.359 25.619-7.076 6.67-4.718 10.005-11.794 10.005-21.229V461.248c0-10.085-3.498-18.707-10.492-25.864-6.995-7.157-15.372-10.735-25.132-10.735-10.086 0-18.707 3.578-25.864 10.735s-10.736 15.779-10.736 25.864v301.096zm112.24 1.464c0 17.894 12.037 26.841 36.112 26.841 24.074 0 36.111-8.947 36.111-26.841v-488c0-27.328-8.296-42.781-24.888-46.36-10.736-2.603-21.31.488-31.72 9.272-10.411 8.784-15.616 21.146-15.616 37.088v488zm114.193 14.152V247.016c0-16.917 5.042-27.002 15.128-30.256 21.797-5.205 43.432-7.808 64.904-7.808 49.775 0 96.136 11.712 139.079 35.136 42.944 23.424 77.674 55.388 104.188 95.892 26.515 40.505 41.887 85.156 46.116 133.957 19.845-8.459 40.991-12.688 63.439-12.688 45.547 0 84.506 16.104 116.876 48.312 32.371 32.209 48.557 70.923 48.557 116.145 0 45.547-16.186 84.424-48.557 116.632-32.37 32.208-71.166 48.312-116.388 48.312l-424.56-.488c-2.929-.976-5.125-2.766-6.589-5.368s-2.193-4.882-2.193-6.834z"></path>
              </svg>
              <span>teetow</span>
            </a>

            <a href="https://indieweb.social/@teetow">
              <svg viewBox="0 0 192 192" role="img" className="footericon">
                <path d="M 133.5 140.2 C 122.4 141.6 111.4 142.8 99.7 142.2 C 80.6 141.3 65.4 137.6 65.4 137.6 C 65.4 139.6 65.6 141.3 65.8 143 C 68.3 161.9 84.5 163 100 163.6 C 115.4 164.1 129.2 159.8 129.2 159.8 L 129.9 173.7 C 129.9 173.7 118.9 179.6 99.7 180.6 C 89 181.2 75.9 180.4 60.4 176.3 C 26.9 167.4 21.2 131.9 20.3 95.5 C 20 84.8 20.2 74.7 20.2 66.3 C 20.2 29.2 44.5 18.4 44.5 18.4 C 56.7 12.8 77.7 10.5 99.4 10.3 L 100 10.3 C 121.8 10.5 142.9 12.8 155 18.4 C 155 18.4 179.2 29.2 179.2 66.3 C 179.2 66.3 179.5 93.6 175.9 112.5 C 173.5 124.5 154.9 137.6 133.5 140.2 Z M 150.6 69.2 C 150.6 59.9 148.3 52.7 143.6 47.3 C 138.8 41.8 132.4 39.2 124.7 39.2 C 115.4 39.2 108.7 42.6 104.1 49.7 L 99.7 57 L 95.2 49.7 C 90.8 42.6 83.8 39.2 74.8 39.2 C 66.9 39.2 60.7 41.8 55.8 47.3 C 51 52.7 48.8 59.9 48.8 69.2 L 48.8 114 L 66.4 114 L 66.4 70.4 C 66.4 61.2 70.3 56.6 78.1 56.6 C 86.6 56.6 90.9 62 90.9 73.1 L 90.9 97 L 108.6 97 L 108.6 73.1 C 108.6 62 112.8 56.6 121.4 56.6 C 129.1 56.6 132.8 61.2 132.8 70.4 L 132.8 114 L 150.6 114 L 150.6 69.2 Z"></path>
              </svg>
              <span>teetow</span>
            </a>
          </div>
        </p>
      </ConfigProvider>
    </>
  );
}

export default App;
