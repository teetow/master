import { ConfigProvider, theme } from "antd";
import { useRef, useState } from "react";
import "./App.css";
import { useLogger } from "./hooks/useLogger";
import { JobRunner } from "./lib/JobRunner";
import { LoudnessParams, applyGain, calcLoudnorm, getLoudness, hasLoudnessParams } from "./lib/ffmpeg";
import { analyzeFile } from "./lib/metadata";
import { Job } from "./lib/types";
import Dropper from "./ui/Dropper";
import Icons from "./ui/Icons";
import Log from "./ui/Log";
import Queue from "./ui/Queue/Queue";
import SocialLink from "./ui/SocialLink";
import Stack from "./ui/Stack";
import TextBlock from "./ui/TextBlock";
import TextLogo from "./ui/TextLogo";

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
    if (!job.src) {
      job.status = "invalid";
      return;
    }

    job.status = "analyzing";
    job.progress = 0;
    updateJob(job);

    job.meta = await analyzeFile(job.src);
    console.log("meta:", job.meta);
    updateJob(job);

    job.status = "measuring";
    job.progress = 0;
    updateJob(job);

    const stats = await getLoudness(job.src, {
      onProgress: (ratio) => {
        job.progress = ratio;
        updateJob(job);
      },
      onMsg: logMsg,
    });

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
    job.stats = { ...job.stats, result_i: job.stats.i + adj, result_tp: job.stats.tp + adj };
    const [audio, outfilename] = await applyGain(job.src, adj, {
      onProgress: (ratio) => {
        job.progress = ratio;
        updateJob(job);
      },
    });
    const audioUrl = URL.createObjectURL(new Blob([audio.buffer], { type: "audio/wav" }));
    job.status = "done";
    job.resultUrl = audioUrl;
    job.resultFilename = outfilename;
    updateJob(job);
    logMsg(`Done processing ${job.src.name}`);
  };

  return (
    <>
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <Stack gap="2rem">
          <TextBlock variant="code" style={{ margin: "0 auto" }}>
            <TextLogo />
          </TextBlock>

          <Stack className="master">
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
