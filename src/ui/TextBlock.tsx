import cx from "classix";
import { ComponentPropsWithoutRef, ElementType, PropsWithChildren } from "react";
import "./TextBlock.css";

const StyleElems = {
  body: {
    className: "body",
  },
  heading: {
    className: "heading",
  },
  log: {
    className: "log",
  },
  code: {
    className: "code",
  },
} satisfies Record<string, { className: string }>;

type Props<T extends ElementType> = PropsWithChildren<{
  as?: T;
  variant?: keyof typeof StyleElems;
  block?: boolean;
}> &
  ComponentPropsWithoutRef<T>;

export default function TextBlock<T extends ElementType>({
  as,
  variant = "body",
  block = false,
  children,
  className,
  ...props
}: Props<T>) {
  const Elem = as ? as : "div";
  return (
    <Elem className={cx("textblock", className, StyleElems[variant].className)} {...props}>
      {children}
    </Elem>
  );
}
