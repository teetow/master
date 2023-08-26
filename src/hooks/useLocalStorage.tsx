import { useEffect, useState } from "react";

type StoredData = Record<string, string | number>;

const readFromStorage = <T extends StoredData>(data: T) =>
  Object.keys(data).reduce(
    (acc, key) => ({ ...acc, ...{ [key]: localStorage.getItem(key) || data[key] } }),
    {} as T
  );

const WriteToStorage = (data: StoredData) =>
  Object.entries(data).forEach(([key, value]) => localStorage.setItem(key, value.toString()));

const useLocalStorage = <T extends StoredData>(data: T) => {
  const [vals, setVals] = useState(readFromStorage(data));

  useEffect(() => {
    WriteToStorage(vals);
  }, [vals]);

  return [vals, setVals] as [typeof vals, typeof setVals];
};

export default useLocalStorage;
