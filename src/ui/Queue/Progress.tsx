import { cx } from "classix";
import type { CSSProperties, HTMLAttributes } from "react";
import "./Progress.css";

type Props = HTMLAttributes<HTMLDivElement> & {
  progress: number;
};

export default function Progress({ className, progress }: Props) {
  return (
    <div
      className={cx("progress", progress >= 0 && "visible", className)}
      {...{ style: { "--progress": progress.toFixed(2) || 0 } as CSSProperties }}
    />
  );
}
