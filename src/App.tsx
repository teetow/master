import { useRef, useState } from "react";
import "./App.css";
import Logo from "./components/Logo";
import SocialLink from "./components/SocialLink";
import { useLogger } from "./hooks/useLogger";
import { JobRunner } from "./lib/JobRunner";
import {
  EncoderParams,
  applyGain,
  calcLoudnorm,
  getLoudness,
  getOpt,
  hasLoudnessParams,
  EncoderParamPresets as presets,
} from "./lib/ffmpeg";
import { analyzeFile } from "./lib/metadata";
import { Job, LoudnessStats } from "./lib/types";
import Input from "./ui/Input";
import Log from "./ui/Log";
import Queue from "./ui/Queue/Queue";
import Select from "./ui/Select";
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

function App() {
  const queue = useRef(new JobRunner());

  const [encoderParams, setEncoderParams] = useState<EncoderParams>({
    bitDepth: "keep",
    sampleRate: "keep",
    target_i: -14,
    target_tp: -1,
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
    console.log(encoderParams);

    Array.from(files).forEach((file) => {
      const newJob: Job = {
        src: file,
        status: "new",
        stats: { ...defaultParams, ...encoderParams },
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
    job.stats = { ...job.stats, ...stats };
    updateJob(job);

    job.status = "adjusting";
    job.progress = 0;
    updateJob(job);

    const adj = calcLoudnorm(job.stats as LoudnessStats);

    const [audio, outfilename] = await applyGain(
      job.src,
      adj,
      {
        onProgress: (ratio) => {
          job.progress = ratio;
          updateJob(job);
        },
      },
      encoderParams
    );
    job.stats = { ...job.stats, result_i: job.stats.i + adj, result_tp: job.stats.tp + adj };

    const audioUrl = URL.createObjectURL(new Blob([audio.buffer], { type: "audio/wav" }));
    job.status = "done";
    job.resultUrl = audioUrl;
    job.resultFilename = outfilename;
    updateJob(job);
    logMsg(`Done processing ${job.src.name}`);
  };

  const handleSetParam = (option: Partial<EncoderParams>) => {
    setEncoderParams((prev) => ({ ...prev, ...option }));
  };

  return (
    <>
      <Stack className="master" gap="2rem">
        <Stack className="header" inline justifyContent="space-between" alignItems="center">
          <Logo.LoudMaster className="applogo" />
          <Stack className="controls" inline gap="var(--theme-space-8)">
            <Input
              label="Integrated"
              value={encoderParams.target_i}
              onChange={(e) => setEncoderParams((prev) => ({ ...prev, target_i: Number(e.target.value) }))}
            />

            <Input
              label="TruePeak"
              value={encoderParams.target_tp}
              onChange={(e) => setEncoderParams((prev) => ({ ...prev, target_tp: Number(e.target.value) }))}
            />

            <Select
              label="Bits"
              value={getOpt(encoderParams.bitDepth, presets.bitDepth)}
              options={presets.bitDepth}
              onChange={(val) => handleSetParam({ bitDepth: val as EncoderParams["bitDepth"] })}
            />

            <Select
              label="Sample rate"
              value={getOpt(encoderParams.sampleRate, presets.sampleRate)}
              options={presets.sampleRate}
              onChange={(val) => handleSetParam({ sampleRate: val as EncoderParams["sampleRate"] })}
            />
          </Stack>
          <Log log={log} style={{ minHeight: 0, fontSize: "0.8em" }} />
        </Stack>

        <Queue queue={jobs} onDrop={handleUploads} />

        <Stack style={{ maxWidth: "40rem" }}>
          <TextBlock variant="heading">
            Readme.nfo
          </TextBlock>
          <TextBlock>
            Drop an audio file to normalize it to a maximum of {encoderParams.target_i} dB LUFS Integrated
            loudness and {encoderParams.target_tp} dB TruePeak. No dynamic compression is applied. All
            processing is done in your browser. Nothing is uploaded. May contain nuts.
          </TextBlock>
        </Stack>

        <Stack
          className="socialbox"
          inline
          gap="var(--theme-space-16)"
          justifyContent="end"
          style={{ gridTemplateColumns: "auto auto auto 1fr" }}
        >
          <SocialLink href="https://github.com/teetow/master">
            <Logo.GitHub /> teetow/master
          </SocialLink>

          <SocialLink href="https://github.com/teetow/master">
            <Logo.Mastodon /> Mastodon
          </SocialLink>

          <SocialLink href="https://github.com/teetow/master">
            <Logo.SoundCloud /> SoundCloud
          </SocialLink>

          <Logo.Seal className="sticker" title="100% AI free, no language model, no user metrics" />
        </Stack>
      </Stack>
    </>
  );
}

export default App;
