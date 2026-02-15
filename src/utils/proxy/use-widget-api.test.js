import { beforeEach, describe, expect, it, vi } from "vitest";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));

vi.mock("swr", () => ({
  default: useSWR,
}));

import useWidgetAPI from "./use-widget-api";

describe("utils/proxy/use-widget-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("formats the proxy url and passes refreshInterval when provided in options", () => {
    useSWR.mockReturnValue({ data: { ok: true }, error: undefined, mutate: "m" });

    const widget = { service_group: "g", service_name: "s", index: 0 };
    const result = useWidgetAPI(widget, "status", { refreshInterval: 123, foo: "bar" });

    expect(useSWR).toHaveBeenCalledWith(
      expect.stringContaining("/api/services/proxy?"),
      expect.objectContaining({ refreshInterval: 123 }),
    );
    expect(result.data).toEqual({ ok: true });
    expect(result.error).toBeUndefined();
    expect(result.mutate).toBe("m");
  });

  it("returns data.error as the top-level error", () => {
    const dataError = { message: "nope" };
    useSWR.mockReturnValue({ data: { error: dataError }, error: undefined, mutate: vi.fn() });

    const widget = { service_group: "g", service_name: "s", index: 0 };
    const result = useWidgetAPI(widget, "status", {});

    expect(result.error).toBe(dataError);
  });

  it("disables the request when endpoint is an empty string", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined, mutate: vi.fn() });

    const widget = { service_group: "g", service_name: "s", index: 0 };
    useWidgetAPI(widget, "");

    expect(useSWR).toHaveBeenCalledWith(null, {});
  });
});
