import type { CSSProperties } from "react";
import "./Progress.css";

export default function Progress({ progress }: { progress: number }) {
  return (
    <div
      className={["progress", progress > -1 ? "visible" : ""].join(" ")}
      {...{ style: { "--progress": progress } as CSSProperties }}
    />
  );
}
