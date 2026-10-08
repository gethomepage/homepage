import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("gitea widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("requests a single item per endpoint to read the total count", () => {
    expect(widget.mappings.notifications.endpoint).toBe("notifications?limit=1");
    expect(widget.mappings.issues.endpoint).toBe("repos/issues/search?type=issues&limit=1");
    expect(widget.mappings.pulls.endpoint).toBe("repos/issues/search?type=pulls&limit=1");
    expect(widget.mappings.repositories.endpoint).toBe("repos/search?limit=1");
  });
});
