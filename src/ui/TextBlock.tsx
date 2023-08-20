import cx from "classix";
import { HTMLAttributes, PropsWithChildren } from "react";
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

type Props = PropsWithChildren<HTMLAttributes<HTMLElement>> & {
  variant?: keyof typeof StyleElems;
  block?: boolean;
};

const getElem = (variant: keyof typeof StyleElems, block = false) => {
  const Tag = block ? "div" : "span";

  return ({ className, children, ...props }: Props) => (
    <Tag className={cx(StyleElems[variant].className, className)} {...props}>
      {children}
    </Tag>
  );
};

export default function TextBlock({ variant = "body", block = false, children, className, ...props }: Props) {
  const Elem = getElem(variant, block);
  return (
    <Elem className={cx("textblock", className)} {...props}>
      {children}
    </Elem>
  );
}
