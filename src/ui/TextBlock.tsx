import cx from "classix";
import { ComponentPropsWithoutRef, ElementType, PropsWithChildren } from "react";
import "./TextBlock.css";

type ElementName = keyof JSX.IntrinsicElements & {};

const asClasses = {
  label: "label",
} as Record<ElementName, string>;

const StyleClasses = {
  body: "body",
  heading: "heading",
  log: "log",
  code: "code",
  label: "label",
} as Record<string, string>;

type Props<T extends ElementType> = PropsWithChildren<{
  as?: T;
  variant?: keyof typeof StyleClasses;
}> &
  ComponentPropsWithoutRef<T>;

export default function TextBlock<T extends ElementType>({
  as,
  variant = "body",
  children,
  className,
  ...props
}: Props<T>) {
  const Elem = as || "div";
  return (
    <Elem
      className={cx(
        "textblock",
        className,
        (as !== undefined && asClasses[as?.toString() as ElementName]) || StyleClasses[variant]
      )}
      {...props}
    >
      {children}
    </Elem>
  );
}
