import { cx } from "classix";
import React, { CSSProperties, HTMLAttributes, PropsWithChildren, forwardRef } from "react";
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

const Stack = forwardRef(
  (
    {
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
    }: Props,
    forwardedRef
  ) => {
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
        ref={forwardedRef}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

export default Stack;
