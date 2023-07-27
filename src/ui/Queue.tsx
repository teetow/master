import { DownloadOutlined } from "@ant-design/icons";
import { ReactNode } from "react";
import { Job } from "../lib/types";
import Progress from "./Progress";
import "./Queue.css";

type Props = {
  queue: Job[];
};

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

export default function Queue({ queue }: Props) {
  return (
    <>
      <ul className="queue">
        {queue.map((item, index) => (
          <li className="item" key={`${index}-${item.src?.name}`}>
            <span className="name">{item?.src?.name}</span>

            <span className="status">{getStatusIcon(item.status)}</span>
            
            {item.resultUrl ? (
              <a className="url" download={item.resultFilename} href={item.resultUrl}>
                <DownloadOutlined />
                {item.resultFilename}
              </a>
            ) : (
              <Progress progress={item.progress || -1} />
            )}

          </li>
        ))}
      </ul>
    </>
  );
}
