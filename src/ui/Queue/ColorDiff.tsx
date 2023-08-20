import cx from "classix";
import { fmt, isNumeric } from "../../lib/units";
import "./ColorDiff.css";

type Props = {
  value: number;
  target?: number;
};

export const ColorDiff = ({ value, target }: Props) => {
  const diff = value - (isNumeric(target) ? target : 0);
  return (
    <span
      className={cx(
        "colordiff",
        diff >= 0.1 ? "over" : diff >= -0.1 ? "at" : diff >= -6 ? "under" : "wayunder"
      )}
    >
      {fmt(value)}
    </span>
  );
};
