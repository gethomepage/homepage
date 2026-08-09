import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("clash widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("validates required response keys for each endpoint", () => {
    expect(widget.mappings.configs.validate).toEqual(["mode"]);
    expect(widget.mappings.proxies.validate).toEqual(["proxies"]);
    expect(widget.mappings.connections.validate).toEqual(["connections"]);
    expect(widget.mappings.version.validate).toEqual(["version"]);
  });

  it("maps the configs, proxies, connections and version endpoints", () => {
    expect(widget.mappings.configs.endpoint).toBe("configs");
    expect(widget.mappings.proxies.endpoint).toBe("proxies");
    expect(widget.mappings.connections.endpoint).toBe("connections");
    expect(widget.mappings.version.endpoint).toBe("version");
  });
});
