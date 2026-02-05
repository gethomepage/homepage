// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useSWR, Resource, Error } = vi.hoisted(() => ({
  useSWR: vi.fn(),
  Resource: vi.fn(() => <div data-testid="resource" />),
  Error: vi.fn(() => <div data-testid="error" />),
}));

vi.mock("swr", () => ({ default: useSWR }));
vi.mock("../widget/resource", () => ({ default: Resource }));
vi.mock("../widget/error", () => ({ default: Error }));

import Network from "./network";

describe("components/widgets/resources/network", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes options.network=true to default interfaceName in the request", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    render(<Network options={{ network: true }} />);

    expect(useSWR).toHaveBeenCalledWith(expect.stringContaining("interfaceName=default"), expect.any(Object));
  });

  it("renders rates and usage percentage when data is present", () => {
    useSWR.mockReturnValue({
      data: {
        network: { rx_sec: 3, tx_sec: 1, rx_bytes: 30, tx_bytes: 10 },
      },
      error: undefined,
    });

    render(<Network options={{ network: "en0", expanded: true }} />);

    const props = Resource.mock.calls[0][0];
    expect(props.value).toContain("1");
    expect(props.value).toContain("↑");
    expect(props.label).toContain("3");
    expect(props.label).toContain("↓");
    expect(props.percentage).toBe(75);
    expect(props.wide).toBe(true);
  });

  it("renders Error when SWR errors", () => {
    useSWR.mockReturnValue({ data: undefined, error: new Error("nope") });

    render(<Network options={{ network: "en0" }} />);

    expect(Error).toHaveBeenCalled();
  });
});
