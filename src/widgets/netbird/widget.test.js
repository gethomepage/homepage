import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("netbird widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("maps the management API endpoints", () => {
    expect(widget.api).toBe("{url}/api/{endpoint}");
    expect(widget.mappings.peers.endpoint).toBe("peers");
    expect(widget.mappings.users.endpoint).toBe("users");
    expect(widget.mappings.version.endpoint).toBe("instance/version");
  });
});
