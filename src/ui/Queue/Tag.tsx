import { cx } from "classix";
import { HTMLAttributes } from "react";
import { isNumeric, parseNumeric } from "../../lib/units";
import Stack from "../Stack";
import { ColorDiff } from "./ColorDiff";
import "./Tag.css";

type Props = {
  value?: string | number;
  as?: React.ElementType;
  label?: string;
  newValue?: string | number;
  targetValue?: string | number;
  unit?: string;
} & HTMLAttributes<React.ElementType>;

const shouldShow = (value: string | number | undefined): value is number =>
  isNumeric(value) && !Number.isNaN(value);

const Tag = ({ label, unit, value, targetValue, newValue, as, className, ...props }: Props) => {
  const Component = as || "div";
  return (
    <>
      <Stack inline as={Component} className={cx("tag", className)} {...props}>
        {label && <span className="label">{label}</span>}

        {shouldShow(value) && shouldShow(targetValue) ? (
          <ColorDiff value={value} target={parseNumeric(targetValue)} />
        ) : (
          <>{value}</>
        )}
        {shouldShow(newValue) && (
          <>
            <span className="arrow">▶</span>
            <ColorDiff value={parseNumeric(newValue)} target={parseNumeric(targetValue)} />
          </>
        )}
        {unit && <span className="unit">{unit}</span>}
      </Stack>
    </>
  );
};

export default Tag;
