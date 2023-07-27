import { HTMLAttributes } from "react";
import "./Log.css";
import { cx } from "classix";

type Props = HTMLAttributes<HTMLDivElement> & {
  log: string[];
};

export default function Log({ className, log, ...props }: Props) {
  return (
    <div className={cx("logger", className)} {...props}>
      <ul className="log">
        {[...log]
          .reverse()
          .map((line, index) => (
            <li key={`${index}-${line}`}>{line}</li>
          ))}
      </ul>
    </div>
  );
}
