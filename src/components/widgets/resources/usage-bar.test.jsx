// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import UsageBar from "./usage-bar";

describe("components/widgets/resources/usage-bar", () => {
  it("normalizes percent to [0, 100] and applies width style", () => {
    const { container: c0 } = render(<UsageBar percent={-5} />);
    const inner0 = c0.querySelector("div > div > div");
    expect(inner0.style.width).toBe("0%");

    const { container: c1 } = render(<UsageBar percent={150} />);
    const inner1 = c1.querySelector("div > div > div");
    expect(inner1.style.width).toBe("100%");
  });
});
