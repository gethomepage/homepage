// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import WidgetLabel from "./widget_label";

describe("components/widgets/widget/widget_label", () => {
  it("renders label text", () => {
    render(<WidgetLabel label="Label A" />);
    expect(screen.getByText("Label A")).toBeInTheDocument();
  });
});
