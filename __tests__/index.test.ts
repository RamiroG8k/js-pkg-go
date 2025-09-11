import { describe, expect, test } from "bun:test";
import { sum } from "../index";

describe("sum function", () => {
  test("should add two numbers correctly", () => {
    expect(sum(2, 3)).toBe(5);
  });

  test("should handle multiple numbers", () => {
    expect(sum(1, 2, 3, 4, 5)).toBe(15);
  });

  test("should return 0 for no arguments", () => {
    expect(sum()).toBe(0);
  });

  test("should handle negative numbers", () => {
    expect(sum(-1, -2, -3)).toBe(-6);
  });

  test("should handle decimal numbers", () => {
    expect(sum(1.5, 2.5)).toBe(4);
  });
});
