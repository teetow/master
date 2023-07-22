import { ReactElement, ReactNode, useState } from "react";

export function useLogger() {
  const [log, setLog] = useState<ReactNode[]>([]);

  const logMsg = (message: string | ReactElement) => {
    setLog((prev) => [...prev, message]);
  };

  const clearLog = () => setLog([]);

  return [log, logMsg, clearLog] as [
    string[],
    (message: string | ReactElement) => string,
    () => void
  ];
}
