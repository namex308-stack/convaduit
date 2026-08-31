import { describe, expect, it } from "vitest";
import {
  hasLoadTestSignal,
  isLoadTestMockEnv,
  resolveLoadTestMode,
} from "@/lib/load-test/mode";

describe("resolveLoadTestMode", () => {
  it("is off when the header and query are absent", () => {
    expect(
      resolveLoadTestMode({ headerValue: null, queryValue: null }, { NODE_ENV: "development" })
    ).toBe("off");
  });

  it("mocks in development when X-Load-Test is true", () => {
    expect(
      resolveLoadTestMode(
        { headerValue: "true", queryValue: null },
        { NODE_ENV: "development" }
      )
    ).toBe("mock");
  });

  it("mocks in test when loadTest=true query is set", () => {
    expect(
      resolveLoadTestMode({ headerValue: null, queryValue: "1" }, { NODE_ENV: "test" })
    ).toBe("mock");
  });

  it("rejects the signal in production", () => {
    expect(
      resolveLoadTestMode(
        { headerValue: "true", queryValue: null },
        { NODE_ENV: "production" }
      )
    ).toBe("rejected");
    expect(
      resolveLoadTestMode(
        { headerValue: null, queryValue: "true" },
        { NODE_ENV: "production" }
      )
    ).toBe("rejected");
  });

  it("rejects the signal when NODE_ENV is neither development nor test", () => {
    expect(
      resolveLoadTestMode({ headerValue: "true", queryValue: null }, { NODE_ENV: "preview" })
    ).toBe("rejected");
  });
});

describe("hasLoadTestSignal", () => {
  it("treats true/1/yes as on and ignores other values", () => {
    expect(hasLoadTestSignal({ headerValue: "true", queryValue: null })).toBe(true);
    expect(hasLoadTestSignal({ headerValue: "YES", queryValue: null })).toBe(true);
    expect(hasLoadTestSignal({ headerValue: "false", queryValue: null })).toBe(false);
    expect(hasLoadTestSignal({ headerValue: "", queryValue: null })).toBe(false);
  });
});

describe("isLoadTestMockEnv", () => {
  it("allows only development and test", () => {
    expect(isLoadTestMockEnv({ NODE_ENV: "development" })).toBe(true);
    expect(isLoadTestMockEnv({ NODE_ENV: "test" })).toBe(true);
    expect(isLoadTestMockEnv({ NODE_ENV: "production" })).toBe(false);
  });
});
