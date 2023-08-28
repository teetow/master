import { cx } from "classix";
import { CSSProperties, HTMLAttributes, useState } from "react";
import Icons from "../components/Icons";
import type { Entry } from "../hooks/useLogger";
import Stack from "../ui/Stack";
import "./Log.css";

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
              <Stack as="li" className="entry expander" onClick={toggleExpanded} justifyContent="end">
                <Icons.ChevronUp />
              </Stack>
            )}
            {[...log].reverse().map((entry) => (
              <li
                className="entry"
                key={`${entry.timestamp}`}
                style={{ "--age": getAge(entry.timestamp) } as CSSProperties}
              >
                {entry.msg}
              </li>
            ))}
          </>
        ) : (
          hasEntries && (
            <Stack
              as="li"
              className="entry expander"
              justifyContent="space-between"
              inline
              onClick={toggleExpanded}
            >
              <span className="msg">{hasEntries && log[log.length - 1].msg}</span>
              {log.length >= 1 && <Icons.ChevronDown />}
            </Stack>
          )
        )}
      </Stack>
    </div>
  );
}
