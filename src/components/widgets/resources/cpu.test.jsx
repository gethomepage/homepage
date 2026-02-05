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

import Cpu from "./cpu";

describe("components/widgets/resources/cpu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a placeholder Resource while loading", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    render(<Cpu expanded refresh={1000} />);

    expect(Resource).toHaveBeenCalled();
    const props = Resource.mock.calls[0][0];
    expect(props.value).toBe("-");
    expect(props.expanded).toBe(true);
  });

  it("renders usage/load values when data is present", () => {
    useSWR.mockReturnValue({
      data: { cpu: { usage: 12.3, load: 1.23 } },
      error: undefined,
    });

    render(<Cpu expanded={false} />);

    const props = Resource.mock.calls[0][0];
    expect(props.value).toBe("12.3");
    expect(props.expandedValue).toBe("1.23");
    expect(props.percentage).toBe(12.3);
  });

  it("renders Error when SWR errors", () => {
    useSWR.mockReturnValue({ data: undefined, error: new Error("nope") });

    render(<Cpu expanded />);

    expect(Error).toHaveBeenCalled();
  });
});
