import { describe, expect, it } from "vitest";
import { isAppShellRoute, isAuthRuntimePath } from "@/lib/app-routes";
import { getServerLocaleId } from "@/lib/locale/server";

describe("app route classification", () => {
  it("treats product prefixes as shell routes", () => {
    expect(isAppShellRoute("/dashboard")).toBe(true);
    expect(isAppShellRoute("/settings/billing")).toBe(true);
    expect(isAppShellRoute("/")).toBe(false);
    expect(isAppShellRoute("/pricing")).toBe(false);
  });

  it("loads full auth only on product, auth, and checkout paths", () => {
    expect(isAuthRuntimePath("/dashboard")).toBe(true);
    expect(isAuthRuntimePath("/auth")).toBe(true);
    expect(isAuthRuntimePath("/checkout")).toBe(true);
    expect(isAuthRuntimePath("/")).toBe(false);
    expect(isAuthRuntimePath("/blog")).toBe(false);
  });
});

describe("getServerLocaleId", () => {
  it("returns Arabic without reading request headers", async () => {
    await expect(getServerLocaleId()).resolves.toBe("ar");
  });
});
