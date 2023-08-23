import { ReactElement, useState } from "react";

export type Entry = {
  msg: string | ReactElement;
  timestamp: Date;
  // type: "msg" | "alert";
};

export function useLogger() {
  const [log, setLog] = useState<Entry[]>([]);

  const logMsg = (message: string | ReactElement) => {
    setLog((prev) => [...prev, { msg: message, timestamp: new Date() }]);
  };

  const clearLog = () => setLog([]);

  return [log, logMsg, clearLog] as [Entry[], (message: string | ReactElement) => string, () => void];
}
