import { cx } from "classix";
import { HTMLAttributes } from "react";
import "./Logo.css";

type Props = {} & HTMLAttributes<HTMLOrSVGElement>;

const Logo = ({ className, ...props }: Props) => (
  <svg
    className={cx("logo", className)}
    fill="#fc0"
    fillRule="evenodd"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 38 24"
    {...props}
  >
    <path d="M 8 13 L 0 13 L 0 0 L 4 0 L 4 10 L 8 10 L 8 13 Z" />
    <path d="M 36 16 L 36 20 L 35 20 L 35 16 L 36 16 Z M 36 22 L 36 24 L 38 24 L 38 22 L 37 21 L 38 20 L 38 15 L 37 14 L 33 14 L 33 24 L 35 24 L 35 22 L 36 22 Z" />
    <path d="M 32 14 L 32 16 L 29 16 L 29 18 L 32 18 L 32 20 L 29 20 L 29 22 L 32 22 L 32 24 L 27 24 L 27 14 L 32 14 Z" />
    <path d="M 26 14 L 26 16 L 24 16 L 24 24 L 22 24 L 22 16 L 21 16 L 21 14 L 26 14 Z" />
    <path d="M 20 14 L 20 16 L 17 16 L 17 18 L 20 18 L 21 19 L 21 23 L 20 24 L 15 24 L 15 22 L 19 22 L 19 20 L 16 20 L 15 19 L 15 15 L 16 14 L 20 14 Z" />
    <path d="M 12 16 L 12 20 L 11 20 L 11 16 L 12 16 Z M 12 22 L 12 24 L 14 24 L 14 15 L 13 14 L 10 14 L 9 15 L 9 24 L 11 24 L 11 22 L 12 22 Z" />
    <path d="M 7 14 L 8 15 L 8 24 L 6 24 L 6 16 L 5 16 L 5 24 L 3 24 L 3 16 L 2 16 L 2 24 L 0 24 L 0 15 L 1 14 L 3 14 L 4 15 L 5 14 L 7 14 Z" />
    <path d="M 34 3 L 34 10 L 33 10 L 33 3 L 34 3 Z M 29 13 L 29 0 L 36 0 L 38 2 L 38 11 L 36 13 L 29 13 Z" />
    <path d="M 23 0 L 23 10 L 24 10 L 24 0 L 28 0 L 28 12 L 27 13 L 20 13 L 19 12 L 19 0 L 23 0 Z" />
    <path d="M 14 3 L 14 10 L 13 10 L 13 3 L 14 3 Z M 10 0 L 17 0 L 18 1 L 18 12 L 17 13 L 10 13 L 9 12 L 9 1 L 10 0 Z" />
  </svg>
);

export default Logo;