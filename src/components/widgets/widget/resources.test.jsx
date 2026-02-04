// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Resource from "./resource";
import Resources from "./resources";
import WidgetLabel from "./widget_label";

function FakeIcon() {
  return <svg />;
}

describe("components/widgets/widget/resources", () => {
  it("filters children to Resource + WidgetLabel and wraps them in a link", () => {
    render(
      <Resources options={{ href: "http://example" }} target="_self" additionalClassNames="x">
        {[
          <Resource key="r" icon={FakeIcon} value="v" label="l" />,
          <WidgetLabel key="w" label="Label" />,
          <div key="o">Other</div>,
        ]}
      </Resources>,
    );

    expect(screen.getByRole("link").getAttribute("href")).toBe("http://example");
    expect(screen.getByText("v")).toBeInTheDocument();
    expect(screen.getByText("Label")).toBeInTheDocument();
    expect(screen.queryByText("Other")).toBeNull();
  });
});
