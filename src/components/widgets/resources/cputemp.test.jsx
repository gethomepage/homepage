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

import CpuTemp from "./cputemp";

describe("components/widgets/resources/cputemp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholder when temperature data is missing", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });
    render(<CpuTemp expanded units="metric" />);

    const props = Resource.mock.calls[0][0];
    expect(props.value).toBe("-");
  });

  it("averages core temps, converts to fahrenheit and computes percentage", () => {
    useSWR.mockReturnValue({
      data: { cputemp: { main: 10, cores: [10, 10], max: 20 } },
      error: undefined,
    });

    render(<CpuTemp expanded={false} units="imperial" tempmin={0} tempmax={-1} />);

    const props = Resource.mock.calls[0][0];
    // common.number mock returns string of value
    expect(props.value).toBe("50");
    expect(props.expandedValue).toBe("68");
    expect(props.percentage).toBe(74);
  });

  it("renders Error when SWR errors", () => {
    useSWR.mockReturnValue({ data: undefined, error: new Error("nope") });

    render(<CpuTemp expanded units="metric" />);

    expect(Error).toHaveBeenCalled();
  });
});
