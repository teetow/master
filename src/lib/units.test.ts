import { describe, expect, it } from "vitest";
import { isNumeric, parseNumeric } from "./units";

describe("isNumeric", () => {
  it("identifies numbers", () => {
    expect(isNumeric(1)).toBe(true);
    expect(isNumeric(-1)).toBe(true);
    expect(isNumeric(1.1)).toBe(true);
    expect(isNumeric(0)).toBe(true);
  });

  it("identifies integers in strings", () => {
    expect(isNumeric("1")).toBe(true);
    expect(isNumeric("-1")).toBe(true);
    expect(isNumeric("1.1")).toBe(true);
    expect(isNumeric("0")).toBe(true);
  });

  it("identifies bad strings", () => {
    expect(isNumeric("derp")).toBe(false);
    expect(isNumeric("level -1,0 dB")).toBe(false);
  });
});

describe("parseNumeric", () => {
  it("works", () => {
    expect(parseNumeric("1.0")).toEqual(1);
    expect(parseNumeric("-1.1")).toEqual(-1.1);
    expect(parseNumeric("0")).toEqual(0);
  });

  it("handles tricky stuff", () => {
    expect(parseNumeric("-1.1 dB")).toEqual(-1.1);
    expect(parseNumeric("-1,5 dB")).toEqual(-1);
  });
});
