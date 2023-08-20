export function unit(value: string | number): string {
  return value.toString();
}

export const fmt = (num: number) => (Number.isInteger(num) ? num.toString() : num.toFixed(2));

export const isNumeric = (val: string | number | undefined): val is number => {
  if (val === undefined) {
    return false;
  }

  if (typeof val === "number") {
    return true;
  }
  return !Number.isNaN(val) && !Number.isNaN(parseFloat(val));
};

export const parseNumeric = (val: string | number | undefined): number => {
  if (val === undefined) return NaN;

  if (typeof val === "number") {
    return val;
  }

  return parseFloat(val);
};

export function getFileExt(path: string) {
  if (path.indexOf(".") < 0) return "";

  return `.${path.split(".").pop()}`;
}
