import { cx } from "classix";
import { HTMLAttributes } from "react";
import { isNumeric, parseNumeric } from "../../lib/units";
import Stack from "../Stack";
import { ColorDiff } from "./ColorDiff";
import "./Tag.css";

type Props = {
  value: string | number;
  as?: React.ElementType;
  label?: string;
  newValue?: string | number;
  targetValue?: string | number;
  unit?: string;
} & HTMLAttributes<React.ElementType>;

const Tag = ({ label, unit, value, targetValue, newValue, as, className, ...props }: Props) => {
  const Component = as || "div";
  return (
    <>
      <Stack inline as={Component} className={cx("tag", className)} {...props}>
        {label && <span className="label">{label}</span>}

        {isNumeric(value) && isNumeric(targetValue) ? (
          <ColorDiff value={value} target={parseNumeric(targetValue)} />
        ) : (
          <>{value}</>
        )}
        {newValue && (
          <>
            <span className="arrow">▶</span>
            <ColorDiff value={parseNumeric(newValue)} target={parseNumeric(targetValue)} />
            <span className="dB">dB</span>
          </>
        )}
      </Stack>
    </>
  );
};

export default Tag;
