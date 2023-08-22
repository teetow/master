import { cx } from "classix";
import { type CSSProperties, type HTMLAttributes } from "react";
import "./Progress.css";

type BaseProps = HTMLAttributes<HTMLDivElement> & {
  progress: number;
  size?: number;
};

type VariantProps =
  | { linear?: true; radial?: never; radius?: never }
  | { linear?: never; radial?: true; radius?: number };

type Props = BaseProps & VariantProps;

export default function Progress({ className, progress, radial, size = 40, radius = 16 }: Props) {
  className = cx("progress", className);
  const props = {
    className: cx(className, progress >= 0 ? "visible" : undefined),
    style: {
      "--progress": progress || 0,
      "--size": size,
      "--radius": radius,
    } as CSSProperties,
  };

  if (radial) {
    return (
      <svg
        viewBox={`0 0 ${size} ${size}`}
        {...{ ...props, className: cx(props.className, "radial") }}
      >
        <circle className="path-stroke" r={radius} cx={size / 2} cy={size / 2} />
      </svg>
    );
  } else return <div {...{ ...props, className: cx(props.className, "linear") }} />;
}
