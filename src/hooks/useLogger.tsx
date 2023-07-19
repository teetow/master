import { useState } from "react";

export function useLogger() {
  const [log, setLog] = useState<string[]>([]);

  const logMsg = (message: string) => {
    setLog((prev) => [...prev, message]);
  };

  return [log, logMsg] as [string[], (message: string) => string];
}
