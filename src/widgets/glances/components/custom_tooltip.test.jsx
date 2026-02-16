// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CustomTooltip from "./custom_tooltip";

describe("widgets/glances/components/custom_tooltip", () => {
  it("returns null when inactive", () => {
    const { container } = render(<CustomTooltip active={false} payload={[]} formatter={(v) => String(v)} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders formatted values and series names when active", () => {
    render(
      <CustomTooltip
        active
        formatter={(v) => `v=${v}`}
        payload={[
          { value: 1, name: "A" },
          { value: 2, name: "B" },
        ]}
      />,
    );

    expect(screen.getByText("v=1 A")).toBeInTheDocument();
    expect(screen.getByText("v=2 B")).toBeInTheDocument();
  });
});
