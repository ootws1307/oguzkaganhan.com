import { describe, expect, test } from "bun:test";
import { pickLocale } from "./locale";

describe("pickLocale", () => {
  test("returns the requested locale when filled", () => {
    expect(pickLocale({ tr: "Merhaba", en: "Hello" }, "en")).toBe("Hello");
  });

  test("falls back to the other locale when the requested one is empty", () => {
    expect(pickLocale({ tr: "Merhaba", en: "  " }, "en")).toBe("Merhaba");
  });

  test("treats an object as filled when any field has text", () => {
    const value = { tr: { title: "Başlık", body: "" }, en: { title: "", body: "" } };
    expect(pickLocale(value, "en")).toEqual({ title: "Başlık", body: "" });
  });

  test("returns undefined for a missing value", () => {
    expect(pickLocale(null, "tr")).toBeUndefined();
  });
});
