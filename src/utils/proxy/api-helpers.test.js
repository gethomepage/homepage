import { describe, expect, it } from "vitest";

import {
  asJson,
  formatApiCall,
  formatProxyUrl,
  getURLSearchParams,
  jsonArrayFilter,
  jsonArrayTransform,
  parseVersionForUrl,
  sanitizeErrorURL,
} from "./api-helpers";

describe("utils/proxy/api-helpers", () => {
  it("formatApiCall replaces placeholders and trims trailing slashes for {url}", () => {
    expect(formatApiCall("{url}/{endpoint}", { url: "http://localhost///", endpoint: "api" })).toBe(
      "http://localhost/api",
    );
  });

  it("formatApiCall replaces repeated placeholders", () => {
    expect(formatApiCall("{a}-{a}-{missing}", { a: "x" })).toBe("x-x-");
  });

  it("parseVersionForUrl accepts canonical non-negative integers", () => {
    expect(parseVersionForUrl("3")).toBe(3);
    expect(parseVersionForUrl(4)).toBe(4);
    expect(parseVersionForUrl(undefined, 3)).toBe(3);
  });

  it("parseVersionForUrl rejects non-canonical values", () => {
    expect(parseVersionForUrl("3/../../path", 3)).toBe(3);
    expect(parseVersionForUrl("1e2", 3)).toBe(3);
    expect(parseVersionForUrl("0x10", 3)).toBe(3);
    expect(parseVersionForUrl(-1, 3)).toBe(3);
    expect(parseVersionForUrl(Number.NaN, 3)).toBe(3);
  });

  it("getURLSearchParams includes group/service/index and optionally endpoint", () => {
    const widget = { service_group: "g", service_name: "s", index: "0" };

    const withEndpoint = getURLSearchParams(widget, "stats");
    expect(withEndpoint.get("group")).toBe("g");
    expect(withEndpoint.get("service")).toBe("s");
    expect(withEndpoint.get("index")).toBe("0");
    expect(withEndpoint.get("endpoint")).toBe("stats");

    const withoutEndpoint = getURLSearchParams(widget);
    expect(withoutEndpoint.get("endpoint")).toBeNull();
  });

  it("formatProxyUrl builds expected proxy URL and encodes query params", () => {
    const widget = { service_group: "g", service_name: "s", index: "2" };
    const url = formatProxyUrl(widget, "health", { a: 1, b: "x" });

    expect(url.startsWith("/api/services/proxy?")).toBe(true);

    const qs = url.split("?")[1];
    const params = new URLSearchParams(qs);
    expect(params.get("group")).toBe("g");
    expect(params.get("service")).toBe("s");
    expect(params.get("index")).toBe("2");
    expect(params.get("endpoint")).toBe("health");

    expect(JSON.parse(params.get("query"))).toEqual({ a: 1, b: "x" });
  });

  it("asJson parses JSON buffers and returns non-JSON values unchanged", () => {
    expect(asJson(Buffer.from(JSON.stringify({ ok: true })))).toEqual({ ok: true });
    expect(asJson(Buffer.from(""))).toEqual(Buffer.from(""));
    expect(asJson(null)).toBeNull();
  });

  it("jsonArrayTransform transforms arrays and returns non-arrays unchanged", () => {
    const data = Buffer.from(JSON.stringify([{ a: 1 }, { a: 2 }]));
    expect(jsonArrayTransform(data, (items) => items.map((i) => i.a))).toEqual([1, 2]);

    expect(jsonArrayTransform(Buffer.from(JSON.stringify({ ok: true })), () => "nope")).toEqual({ ok: true });
  });

  it("jsonArrayFilter filters arrays and returns non-arrays unchanged", () => {
    const data = Buffer.from(JSON.stringify([{ a: 1 }, { a: 2 }]));
    expect(jsonArrayFilter(data, (item) => item.a > 1)).toEqual([{ a: 2 }]);
  });

  it("sanitizeErrorURL returns only the hostname regardless of where credentials appear", () => {
    const input = "https://user:pass@example.com/secret-path-key/status?custom_secret=abc#token=xyz";
    expect(sanitizeErrorURL(input)).toBe("example.com (see logs for details)");
  });

  it("sanitizeErrorURL accepts URL objects and omits the port", () => {
    expect(sanitizeErrorURL(new URL("http://192.168.1.10:8080/api?apikey=123"))).toBe(
      "192.168.1.10 (see logs for details)",
    );
  });
});
