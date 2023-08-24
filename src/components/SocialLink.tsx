import { cx } from "classix";
import { HTMLAttributes, PropsWithChildren } from "react";
import "./SocialLink.css";

type Props = PropsWithChildren<HTMLAttributes<HTMLSpanElement>> & {
  href: string;
};

export default function SocialLink({ className, href, children }: Props) {
  return (
    <a className={cx("sociallink", className)} href={href}>
      {children}
    </a>
  );
}
