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

import Uptime from "./uptime";

describe("components/widgets/resources/uptime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a placeholder while loading", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    render(<Uptime />);
    expect(Resource).toHaveBeenCalled();
    expect(Resource.mock.calls[0][0].value).toBe("-");
  });

  it("renders formatted duration and sets percentage based on current seconds", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2020-01-01T00:00:30.000Z"));

      useSWR.mockReturnValue({ data: { uptime: 1234 }, error: undefined });
      render(<Uptime />);

      const props = Resource.mock.calls[0][0];
      expect(props.value).toBe("1234");
      expect(props.percentage).toBe("50");
    } finally {
      vi.useRealTimers();
    }
  });

  it("renders Error when SWR errors", () => {
    useSWR.mockReturnValue({ data: undefined, error: new Error("nope") });

    render(<Uptime />);

    expect(Error).toHaveBeenCalled();
  });
});
