import { describe, expect, it } from "vitest";

import {
  asJson,
  formatApiCall,
  formatProxyUrl,
  getURLSearchParams,
  jsonArrayFilter,
  jsonArrayTransform,
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

  it("sanitizeErrorURL redacts sensitive query params and hash fragments", () => {
    const input = "https://example.com/path?apikey=123&token=abc#access_token=xyz&other=1";
    const output = sanitizeErrorURL(input);

    const url = new URL(output);
    expect(url.searchParams.get("apikey")).toBe("***");
    expect(url.searchParams.get("token")).toBe("***");
    expect(url.hash).toContain("access_token=***");
    expect(url.hash).toContain("other=1");
  });

  it("sanitizeErrorURL only redacts known keys", () => {
    const input = "https://example.com/path?api_key=123&safe=ok#auth=abc&safe_hash=1";
    const output = sanitizeErrorURL(input);

    const url = new URL(output);
    expect(url.searchParams.get("api_key")).toBe("***");
    expect(url.searchParams.get("safe")).toBe("ok");
    expect(url.hash).toContain("auth=***");
    expect(url.hash).toContain("safe_hash=1");
  });
});
