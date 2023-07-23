import type { Meta } from "../hooks/useFileMeta";
import type { LoudnessParams } from "../lib/ffmpeg";
import { ColorDiff } from "./ColorDiff";
import "./Stats.css";

type Props = {
  stats: Partial<
    Meta &
      LoudnessParams & {
        result_i: number;
        result_tp: number;
      }
  >;
};

export default function Stats({ stats }: Props) {
  return (
    <div className="stats">
      {stats?.srate && <span className="box srate">{stats.srate}</span>}
      {stats?.bitdepth && <span className="box bitdepth">{stats.bitdepth}</span>}
      {stats?.channels && <span className="box channels">{stats.channels}</span>}
      {stats?.i && (
        <span className="box i">
          <span className="info">I</span>
          <span className="i">{ColorDiff(stats.i, stats.target_i || -99)} dB</span>
          {stats.result_i && (
            <span className="result_i">
              ▶ {ColorDiff(stats.result_i, stats.target_i || -99)} dB
            </span>
          )}
        </span>
      )}
      {stats?.tp && (
        <span className="box tp">
          <span className="info">TP</span>
          <span className="tp">{ColorDiff(stats.tp, stats.target_tp || -14)} dB</span>
          {stats.result_tp && (
            <span className="result_tp">
              ▶ {ColorDiff(stats.result_tp, stats.target_tp || -1)} dB
            </span>
          )}
        </span>
      )}
    </div>
  );
}
