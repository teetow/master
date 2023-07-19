import { useState } from "react";

type PropDef<T> = {
  trigger: string;
  parser: (s: string) => T;
};

export function useMatcher<T extends {}>(defs: PropDef<T>[]) {
  const [data, setData] = useState<T>();

  const match = (message: string) => {
    if (!message) {
      return;
    }

    defs.map((def) => {
      if (!message.includes(def.trigger)) {
        return;
      }
      const yoink = def.parser(message);
      if (!yoink) return;
      setData((prev) => ({ ...prev, ...yoink }));
    });
  };

  return [data, match] as [T, (message: string) => void];
}
