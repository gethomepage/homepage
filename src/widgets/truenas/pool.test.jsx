// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Pool from "./pool";

describe("widgets/truenas/pool", () => {
  it("renders pool name, usage percent, and status color", () => {
    const { container } = render(<Pool name="tank" free={50} allocated={50} healthy={false} />);
    expect(screen.getByText("tank")).toBeInTheDocument();

    // 50 / 100 => 50%
    expect(container.textContent).toContain("(50%)");

    // status color reflects healthy=false
    expect(container.querySelector(".bg-yellow-500")).toBeTruthy();
  });
});
