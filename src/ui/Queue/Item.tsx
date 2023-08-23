import { DownloadOutlined } from "@ant-design/icons";
import { ReactNode } from "react";
import { Job } from "../../lib/types";
import Stack from "../Stack";
import "./Item.css";
import Progress from "./Progress";
import Tag from "./Tag";

type JobStatus = Job["status"];

const StatusIcons = {
  new: "--",
  invalid: "❓",
  analyzing: "Analyzing",
  measuring: "Measuring",
  adjusting: "Adjusting",
  done: "✔",
  failed: "❌",
} satisfies Record<JobStatus, ReactNode>;

const getStatusIcon = (status: JobStatus) => StatusIcons[status];

type Props = Job;

const Item = ({ src, status, resultUrl, resultFilename, progress, stats, meta }: Props) => (
  <>
    <Stack className="queueitem" gap="1rem">
      <Stack className="row details" inline>
        <Stack className="name" inline>
          {!resultUrl ? (
            <span className="jobname">{src?.name}</span>
          ) : (
            <a className="download" download={resultFilename} href={resultUrl}>
              <DownloadOutlined />
              {resultFilename}
            </a>
          )}
        </Stack>

        <Stack className="status" inline gap="0.5rem">
          <span className="statusicon">{getStatusIcon(status)}</span>
          {!resultUrl && (
            <Progress className="progress" progress={progress} radial size={16} radius={7} />
          )}
        </Stack>
      </Stack>

      <Stack className="row stats" inline>
        <Stack className="statbox" inline>
          {meta ? (
            <>
              {meta.type && <Tag value={meta.type} />}
              {meta.srate && <Tag value={meta.srate} />}
              {meta.bitdepth && <Tag value={meta.bitdepth} unit="BIT" />}
              {meta.channels && <Tag value={meta.channels} unit="Ch" />}
            </>
          ) : (
            <>
              <Tag value="Detecting properties..." />
            </>
          )}
        </Stack>

        <Stack className="statbox" inline>
          {!Number.isNaN(stats.i) && (
            <Tag
              label="I"
              unit="dB"
              value={stats.i}
              targetValue={stats.target_i}
              newValue={stats.result_i}
            />
          )}
          {!Number.isNaN(stats.tp) && (
            <Tag
              label="TP"
              unit="dB"
              value={stats.tp}
              targetValue={stats.target_tp}
              newValue={stats.result_tp}
            />
          )}
        </Stack>
      </Stack>
    </Stack>
  </>
);

export default Item;
