// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import WidgetIcon from "./widget_icon";

function FakeIcon(props) {
  return <svg data-testid="icon" {...props} />;
}

describe("components/widgets/widget/widget_icon", () => {
  it("applies size classes and pulse animation", () => {
    render(
      <>
        <WidgetIcon icon={FakeIcon} size="s" />
        <WidgetIcon icon={FakeIcon} size="m" />
        <WidgetIcon icon={FakeIcon} size="l" pulse />
        <WidgetIcon icon={FakeIcon} size="xl" />
      </>,
    );

    const icons = screen.getAllByTestId("icon");
    expect(icons[0].getAttribute("class")).toContain("w-5 h-5");
    expect(icons[1].getAttribute("class")).toContain("w-6 h-6");
    expect(icons[2].getAttribute("class")).toContain("w-8 h-8");
    expect(icons[2].getAttribute("class")).toContain("animate-pulse");
    expect(icons[3].getAttribute("class")).toContain("w-10 h-10");
  });
});
