import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, passwordProblem } from "@/server/auth";

describe("password handling", () => {
  it("hashes with salt and verifies", () => {
    const a = hashPassword("CorrectHorse9Battery");
    const b = hashPassword("CorrectHorse9Battery");
    expect(a).not.toEqual(b);
    expect(verifyPassword("CorrectHorse9Battery", a)).toBe(true);
    expect(verifyPassword("wrong-password-1", a)).toBe(false);
  });
  it("rejects weak passwords", () => {
    expect(passwordProblem("short1")).toBeTruthy();
    expect(passwordProblem("onlyletterslong")).toBeTruthy();
    expect(passwordProblem("LongEnough123")).toBeNull();
  });
});
