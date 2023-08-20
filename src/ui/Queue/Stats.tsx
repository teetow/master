import type { LoudnessParams } from "../../lib/ffmpeg";
import { isNumeric } from "../../lib/units";
import Stack from "../Stack";
import "./Stats.css";
import Tag from "./Tag";

type Props = Partial<LoudnessParams>;

export default function Stats({ i, tp, target_i, target_tp, result_i, result_tp }: Props) {
  return (
    <Stack inline className="stats">
      {isNumeric(i) && target_i && (
        <Tag label="I" unit="dB" value={i} targetValue={target_i} newValue={result_i} />
      )}

      {isNumeric(tp) && target_tp && (
        <Tag label="TP" unit="dB" value={tp} targetValue={target_tp} newValue={result_tp} />
      )}
    </Stack>
  );
}
