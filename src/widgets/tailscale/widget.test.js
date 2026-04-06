import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";
import { formatApiCall } from "utils/proxy/api-helpers";

import widget from "./widget";

describe("tailscale widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("has device and devices mappings", () => {
    expect(widget.mappings.device).toBeTruthy();
    expect(widget.mappings.devices).toBeTruthy();
  });

  it("builds correct single-device URL (backwards compat)", () => {
    const url = formatApiCall(widget.api, {
      endpoint: widget.mappings.device.endpoint,
      deviceid: "test-device-123",
    });
    expect(url).toBe("https://api.tailscale.com/api/v2/device/test-device-123");
  });

  it("builds correct tailnet devices URL with tailnet ID", () => {
    const url = formatApiCall(widget.api, {
      endpoint: widget.mappings.devices.endpoint,
      tailnet: "test-tailnet-456",
    });
    expect(url).toBe("https://api.tailscale.com/api/v2/tailnet/test-tailnet-456/devices?fields=all");
  });

  it("builds correct tailnet devices URL with dash shorthand", () => {
    const url = formatApiCall(widget.api, {
      endpoint: widget.mappings.devices.endpoint,
      tailnet: "-",
    });
    expect(url).toBe("https://api.tailscale.com/api/v2/tailnet/-/devices?fields=all");
  });

  it("builds correct tailnet devices URL with domain name", () => {
    const url = formatApiCall(widget.api, {
      endpoint: widget.mappings.devices.endpoint,
      tailnet: "example.com",
    });
    expect(url).toBe("https://api.tailscale.com/api/v2/tailnet/example.com/devices?fields=all");
  });
});
