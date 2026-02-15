import { expect } from "vitest";

export function expectWidgetConfigShape(widget) {
  expect(widget).toBeTruthy();
  expect(widget).toBeTypeOf("object");

  if ("api" in widget) {
    expect(widget.api).toBeTypeOf("string");
    // Widget APIs are either service-backed (`{url}` template) or third-party API URLs.
    expect(widget.api.includes("{url}") || /^https?:\/\//.test(widget.api)).toBe(true);
  }

  if ("proxyHandler" in widget) {
    expect(widget.proxyHandler).toBeTypeOf("function");
  }

  if ("allowedEndpoints" in widget) {
    expect(widget.allowedEndpoints).toBeInstanceOf(RegExp);
  }

  if ("mappings" in widget) {
    expect(widget.mappings).toBeTruthy();
    expect(widget.mappings).toBeTypeOf("object");

    for (const [name, mapping] of Object.entries(widget.mappings)) {
      expect(name).toBeTruthy();
      expect(mapping).toBeTruthy();
      expect(mapping).toBeTypeOf("object");

      if ("endpoint" in mapping) {
        expect(mapping.endpoint).toBeTypeOf("string");
        expect(mapping.endpoint.length).toBeGreaterThan(0);
      }
      if ("map" in mapping) {
        const map = mapping.map;
        const proxyName = widget.proxyHandler?.name ?? "genericProxyHandler";

        // Most handlers treat `map` as a transform function. A small number of custom
        // proxies treat it as an options object.
        expect(["function", "object"].includes(typeof map)).toBe(true);

        if (typeof map === "object") {
          expect(map).not.toBeNull();
          expect(Array.isArray(map)).toBe(false);
          // Generic handlers will call `map(resultData)`, so they must never receive an object.
          expect(proxyName).not.toBe("genericProxyHandler");
          expect(proxyName).not.toBe("credentialedProxyHandler");
        }
      }
    }
  }
}
