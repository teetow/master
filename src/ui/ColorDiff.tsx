import cx from "classix";
import "./ColorDiff.css";

export const ColorDiff = (value: number, reference: number) => {
  const diff = value - reference;
  return (
    <span
      className={cx(
        "colordiff",
        diff >= 0.1
          ? "over"
          : diff >= -0.1
          ? "at"
          : diff >= -6
          ? "under"
          : "wayunder"
      )}
    >
      {value}
    </span>
  );
};
