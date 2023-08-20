import { cx } from "classix";
import React, { HTMLAttributes, PropsWithChildren } from "react";
import "./Box.css";

type Props = PropsWithChildren<
  {
    as?: React.ElementType;
  } & HTMLAttributes<React.ElementType>
>;

const Box = ({ as, children, className, ...props }: Props) => {
  const Component = as || "div";
  return (
    <Component className={cx("box", className)} {...props}>
      {children}
    </Component>
  );
};

export default Box;
