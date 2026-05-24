import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("graylog widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("defines the count mapping with required params", () => {
    const { count } = widget.mappings;
    expect(count.endpoint).toBe("search/universal/relative");
    expect(count.params).toEqual(["query", "limit"]);
    expect(count.optionalParams).toContain("range");
    expect(count.validate).toContain("total_results");
  });

  it("defines the throughput mapping", () => {
    const { throughput } = widget.mappings;
    expect(throughput.endpoint).toBe("system/metrics/namespace/org.graylog2.throughput");
    expect(throughput.validate).toContain("metrics");
  });

  it("defines the notifications mapping", () => {
    const { notifications } = widget.mappings;
    expect(notifications.endpoint).toBe("system/notifications");
    expect(notifications.validate).toContain("total");
  });

  it("sets the X-Requested-By header", () => {
    expect(widget.headers["X-Requested-By"]).toBe("homepage");
  });
});
