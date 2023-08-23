import { cx } from "classix";
import { CSSProperties, ComponentPropsWithoutRef, ElementType, PropsWithChildren } from "react";
import { unit } from "../lib/units";
import "./Stack.css";

type Props<T extends ElementType> = PropsWithChildren<{
  as?: T;
  alignItems?: CSSProperties["alignItems"];
  alignContent?: CSSProperties["alignContent"];
  justifyItems?: CSSProperties["justifyItems"];
  justifyContent?: CSSProperties["justifyContent"];
  inline?: boolean;
  gap?: string | number;
}> &
  ComponentPropsWithoutRef<T>;

const Stack = <T extends ElementType>({
  as,
  alignItems,
  alignContent,
  justifyItems,
  justifyContent,
  children,
  className,
  gap,
  inline,
  style,
  ...props
}: Props<T>) => {
  const Component = as || "div";
  return (
    <Component
      className={cx("stack", className, inline && "inline", inline === false && "block")}
      style={{
        ...style,
        ...(alignItems && { alignItems: alignItems }),
        ...(alignContent && { alignContent: alignContent }),
        ...(justifyItems && { justifyItems: justifyItems }),
        ...(justifyContent && { justifyContent: justifyContent }),
        ...(gap !== undefined && { gap: unit(gap) }),
      }}
      {...props}
    >
      {children}
    </Component>
  );
};
export default Stack;
