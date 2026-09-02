// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import useDataPoints from "./use-data-points";

describe("widgets/glances/metrics/use-data-points", () => {
  it("appends data points while keeping the requested history length", () => {
    const { result, rerender } = renderHook(({ pointsLimit }) => useDataPoints(pointsLimit, { value: 0 }), {
      initialProps: { pointsLimit: 3 },
    });

    expect(result.current[0]).toEqual([{ value: 0 }, { value: 0 }, { value: 0 }]);

    act(() => result.current[1]({ value: 1 }));
    expect(result.current[0]).toEqual([{ value: 0 }, { value: 0 }, { value: 1 }]);

    rerender({ pointsLimit: 2 });
    act(() => result.current[1]({ value: 2 }));
    expect(result.current[0]).toEqual([{ value: 1 }, { value: 2 }]);
  });
});
