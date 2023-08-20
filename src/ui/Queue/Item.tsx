import { DownloadOutlined } from "@ant-design/icons";
import { ReactNode } from "react";
import { Job } from "../../lib/types";
import Stack from "../Stack";
import "./Item.css";
import Progress from "./Progress";
import Stats from "./Stats";
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
    <Stack className="item" gap="1em">
      <Stack className="row" inline>
        <Stack inline>
          {meta && (
            <Stack className="meta" inline gap="0.5em">
              {meta.type && <Tag value={meta.type} />}
              {meta.srate && <Tag value={meta.srate} />}
              {meta.bitdepth && <Tag value={meta.bitdepth} />}
              {meta.channels && <Tag value={meta.channels} />}
            </Stack>
          )}
        </Stack>
        <Stats {...stats} />
      </Stack>

      <Stack className="row" inline>
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

        <Stack className="status" inline gap="1em">
          <span className="statusicon">{getStatusIcon(status)}</span>
          {!resultUrl && <Progress className="progress" progress={progress || -1} />}
        </Stack>
      </Stack>
    </Stack>
  </>
);

export default Item;
