import { CSSProperties, HTMLAttributes, useState } from "react";
import "./Log.css";
import { cx } from "classix";
import type { Entry } from "../hooks/useLogger";
import Stack from "./Stack";
import Icons from "../components/Icons";

type Props = HTMLAttributes<HTMLDivElement> & {
  log: Entry[];
};

const getAge = (ts: Date) => (Date.now() - ts.getTime()) / 1000;

export default function Log({ className, log, ...props }: Props) {
  const [expanded, setExpanded] = useState(false);
  const hasEntries = log.length > 0;
  const toggleExpanded = () => setExpanded((prev) => !prev);

  return (
    <div className={cx("logger", className)} {...props}>
      <Stack as="ul" className={cx("log", expanded && "is-expanded", hasEntries && "has-entries")}>
        {expanded ? (
          <>
            {hasEntries && (
              <>
                <Stack as="li" className="entry expander" onClick={toggleExpanded} justifyContent="end">
                  <Icons.ChevronUp />
                </Stack>
              </>
            )}
            {[...log].reverse().map((entry, index) => (
              <li
                className="entry"
                key={`${index}-${entry}`}
                style={{ "--age": getAge(entry.timestamp) } as CSSProperties}
              >
                {entry.msg}
              </li>
            ))}
          </>
        ) : (
          hasEntries && (
            <>
              {" "}
              <Stack as="li" className="entry" justifyContent="space-between" inline onClick={toggleExpanded}>
                <span className="msg">{hasEntries && log[log.length - 1].msg}</span>
                {log.length >= 1 && (
                  <span className="expander">
                    <Icons.ChevronDown />
                  </span>
                )}
              </Stack>
            </>
          )
        )}
      </Stack>
    </div>
  );
}
