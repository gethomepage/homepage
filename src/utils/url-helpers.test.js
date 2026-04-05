import { describe, expect, it } from "vitest";

import { ensureUrlProtocol, safeHostnameFromUrl } from "./url-helpers";

describe("ensureUrlProtocol", () => {
  it("adds https when protocol is missing", () => {
    expect(ensureUrlProtocol("example.com")).toBe("https://example.com");
  });

  it("keeps http URLs unchanged", () => {
    expect(ensureUrlProtocol("http://example.com")).toBe("http://example.com");
  });

  it("keeps https URLs unchanged", () => {
    expect(ensureUrlProtocol("https://example.com")).toBe("https://example.com");
  });

  it("keeps custom schemes unchanged", () => {
    expect(ensureUrlProtocol("mailto:test@example.com")).toBe("mailto:test@example.com");
  });

  it("returns non-string values unchanged", () => {
    expect(ensureUrlProtocol(undefined)).toBe(undefined);
    expect(ensureUrlProtocol(null)).toBe(null);
  });

  it("returns empty trimmed strings unchanged", () => {
    expect(ensureUrlProtocol("   ")).toBe("");
  });

  it("trims protocol-less values before adding https", () => {
    expect(ensureUrlProtocol("  example.com/test  ")).toBe("https://example.com/test");
  });
});

describe("safeHostnameFromUrl", () => {
  it("extracts hostname from protocol-less URLs", () => {
    expect(safeHostnameFromUrl("example.com")).toBe("example.com");
  });

  it("extracts hostname from full URLs", () => {
    expect(safeHostnameFromUrl("https://example.com/path")).toBe("example.com");
  });

  it("falls back to the original value when parsing fails", () => {
    expect(safeHostnameFromUrl("not a valid url value")).toBe("not a valid url value");
  });

  it("returns undefined unchanged for invalid input", () => {
    expect(safeHostnameFromUrl(undefined)).toBe(undefined);
  });
});
