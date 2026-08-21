// @vitest-environment jsdom

import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useCurrentTime from "./use-current-time";

function CurrentTime({ refreshInterval }) {
  return <span>{useCurrentTime(refreshInterval)}</span>;
}

describe("utils/hooks/use-current-time", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("updates at the requested interval", () => {
    render(<CurrentTime refreshInterval={5_000} />);
    expect(screen.getByText("1000")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(screen.getByText("6000")).toBeInTheDocument();
  });
});
