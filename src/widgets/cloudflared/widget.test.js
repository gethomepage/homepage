import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";
import { formatApiCall } from "utils/proxy/api-helpers";

import widget from "./widget";

describe("cloudflared widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it.each([
    ["cfd_tunnel", "cfd_tunnel/tunnel-id"],
    ["connections", "cfd_tunnel/tunnel-id/connections"],
  ])("routes %s to the account and tunnel", (endpoint, path) => {
    const mapping = widget.mappings[endpoint];
    expect(
      formatApiCall(widget.api, { accountid: "account-id", tunnelid: "tunnel-id", endpoint: mapping.endpoint }),
    ).toBe(`https://api.cloudflare.com/client/v4/accounts/account-id/${path}`);
    expect(mapping.validate).toEqual(["success", "result"]);
  });
});
