// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Raw from "./raw";

describe("components/widgets/widget/raw", () => {
  it("renders nested Raw content", () => {
    render(
      <Raw>
        <Raw>
          <div>inner</div>
        </Raw>
      </Raw>,
    );

    expect(screen.getByText("inner")).toBeInTheDocument();
  });
});
