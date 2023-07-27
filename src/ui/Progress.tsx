import type { CSSProperties } from "react";
import "./Progress.css";
import { cx } from "classix";

export default function Progress({ progress }: { progress: number }) {
  return (
    <div
      className={cx("progress", progress >= 0 && progress < 1 && "visible")}
      {...{ style: { "--progress": progress || 0 } as CSSProperties }}
    />
  );
}
