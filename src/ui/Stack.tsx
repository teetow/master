import { cx } from "classix";
import React, { CSSProperties, HTMLAttributes, PropsWithChildren } from "react";
import { unit } from "../lib/units";
import "./Stack.css";

type Props = PropsWithChildren<HTMLAttributes<React.ElementType>> & {
  as?: React.ElementType;
  alignItems?: CSSProperties["alignItems"];
  justifyItems?: CSSProperties["justifyItems"];
  justifyContent?: CSSProperties["justifyContent"];
  inline?: boolean;
  gap?: string | number;
};

export default function Stack({
  as,
  alignItems,
  justifyItems,
  justifyContent,
  children,
  className,
  gap,
  inline,
  style,
  ...props
}: Props) {
  const Component = as || "div";
  return (
    <Component
      className={cx("stack", className, inline && "inline", inline === false && "block")}
      style={{
        ...style,
        ...(alignItems && { alignItems: alignItems }),
        ...(justifyItems && { justifyItems: justifyItems }),
        ...(justifyContent && { justifyContent: justifyContent }),
        ...(gap !== undefined && { gap: unit(gap) }),
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
