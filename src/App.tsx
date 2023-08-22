import { ConfigProvider, theme } from "antd";
import { useRef, useState } from "react";
import "./App.css";
import Logo from "./components/Logo";
import { useLogger } from "./hooks/useLogger";
import { JobRunner } from "./lib/JobRunner";
import {
  EncoderOptions,
  LoudnessParams,
  applyGain,
  calcLoudnorm,
  getLoudness,
  hasLoudnessParams,
} from "./lib/ffmpeg";
import { analyzeFile } from "./lib/metadata";
import { Job } from "./lib/types";
import Dropper from "./ui/Dropper";
import Icons from "./ui/Icons";
import Log from "./ui/Log";
import Picker from "./ui/Queue/Picker";
import Queue from "./ui/Queue/Queue";
import SocialLink from "./ui/SocialLink";
import Stack from "./ui/Stack";
import TextBlock from "./ui/TextBlock";

const defaultParams = {
  i: NaN,
  tp: NaN,
  target_i: -14,
  target_tp: -1,
  result_i: NaN,
  result_tp: NaN,
};

type Options = EncoderOptions;

function App() {
  const queue = useRef(new JobRunner());
  const options = useRef<Options>({
    bitDepth: "keep",
    sampleRate: "keep",
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [log, logMsg] = useLogger();

  const updateJob = (job: Job) => {
    setJobs((prev) =>
      prev.map((j) => {
        return job.src === j.src ? job : j;
      })
    );
  };

  const handleUploads = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const newJob: Job = {
        src: file,
        status: "new",
        stats: { ...defaultParams },
        progress: 0,
      };
      setJobs((prev) => [...prev, newJob]);
      queue.current.addJob(async () => {
        await runJob(newJob);
      });
    });
  };

  const runJob = async (job: Job) => {
    const handleProgress = (progress: number) => {
      job.progress = progress;
      updateJob(job);
    };

    if (!job.src) {
      job.status = "invalid";
      return;
    }

    job.progress = 0;
    updateJob(job);

    job.status = "analyzing";

    job.meta = await analyzeFile(job.src, { onProgress: handleProgress });
    console.log("meta:", job.meta);
    updateJob(job);

    job.status = "measuring";
    job.progress = 0;
    updateJob(job);

    const stats = await getLoudness(job.src, { onProgress: handleProgress, onMsg: logMsg });

    if (!hasLoudnessParams(job.stats)) {
      logMsg(`Couldn't get proper values. ${JSON.stringify(job.stats)}`);
      job.status = "failed";
      updateJob(job);
      return;
    }
    job.stats = { ...defaultParams, ...job.stats, ...stats };
    updateJob(job);

    job.status = "adjusting";
    job.progress = 0;
    updateJob(job);

    const adj = calcLoudnorm(job.stats as LoudnessParams);

    const [audio, outfilename] = await applyGain(
      job.src,
      adj,
      {
        onProgress: (ratio) => {
          job.progress = ratio;
          updateJob(job);
        },
      },
      options.current
    );
    job.stats = { ...job.stats, result_i: job.stats.i + adj, result_tp: job.stats.tp + adj };

    const audioUrl = URL.createObjectURL(new Blob([audio.buffer], { type: "audio/wav" }));
    job.status = "done";
    job.resultUrl = audioUrl;
    job.resultFilename = outfilename;
    updateJob(job);
    logMsg(`Done processing ${job.src.name}`);
  };

  const handleSetOption = (option: Partial<Options>) => {
    options.current = { ...options.current, ...option } as Options;
  };

  return (
    <>
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <Stack className="master" gap="2rem">
          <Stack className="header" inline justifyContent="space-between">
            <Logo />
            <Stack inline gap="1rem" style={{ fontSize: "0.8em" }}>
              <Picker
                label="Bit Depth"
                value={options.current.bitDepth}
                options={[
                  { value: "pcm_s16le", label: "16-bit" },
                  { value: "pcm_s24le", label: "24-bit" },
                  { value: "pcm_s32le", label: "32-bit" },
                  { value: "keep", label: "Keep" },
                ]}
                onChange={(val) => handleSetOption({ bitDepth: val as Options["bitDepth"] })}
              />
              <Picker
                label="Sample Rate"
                value={options.current.sampleRate}
                options={[
                  { value: 44100, label: "44100" },
                  { value: 48000, label: "48000" },
                  { value: "keep", label: "Keep" },
                ]}
                onChange={(val) => handleSetOption({ sampleRate: val as Options["sampleRate"] })}
              />
            </Stack>
          </Stack>

          <Stack className="dropzone" gap="2rem">
            <Dropper onDrop={handleUploads} />
            <Queue queue={jobs} />
            <Log log={log} style={{ minHeight: 0 }} />
          </Stack>

          <Stack style={{ maxWidth: "40rem" }}>
            <TextBlock block variant="heading">
              Readme.nfo
            </TextBlock>
            <TextBlock>
              Drop a .wav file to normalize it to -14 dB LUFS Integrated loudness and -1 dB TruePeak. All
              processing is done in your browser. Nothing is uploaded. May contain nuts.
            </TextBlock>
          </Stack>

          <Stack className="socialbox" inline alignItems="center" gap="2rem">
            <SocialLink href="https://github.com/teetow/master">
              <Icons.GitHub /> teetow/master
            </SocialLink>

            <SocialLink href="https://github.com/teetow/master">
              <Icons.Mastodon /> Mastodon
            </SocialLink>

            <SocialLink href="https://github.com/teetow/master">
              <Icons.SoundCloud /> SoundCloud
            </SocialLink>
          </Stack>
        </Stack>
      </ConfigProvider>
    </>
  );
}

export default App;
