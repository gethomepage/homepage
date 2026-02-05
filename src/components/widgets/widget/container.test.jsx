// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

import Container, { getAllClasses } from "./container";
import PrimaryText from "./primary_text";
import Raw from "./raw";
import SecondaryText from "./secondary_text";
import WidgetIcon from "./widget_icon";

function FakeIcon(props) {
  return <svg data-testid="fake-icon" {...props} />;
}

describe("components/widgets/widget/container", () => {
  it("getAllClasses supports boxedWidgets + cardBlur and right alignment", () => {
    const boxed = getAllClasses({ style: { header: "boxedWidgets", cardBlur: "md" } }, "x");
    expect(boxed).toContain("backdrop-blur-md");
    expect(boxed).toContain("x");

    const right = getAllClasses({ style: { isRightAligned: true } }, "y");
    expect(right).toContain("justify-center");
    expect(right).toContain("y");
    expect(right).not.toContain("max-w:full");
  });

  it("renders an anchor when href is provided and prefers options.target over settings.target", () => {
    renderWithProviders(
      <Container options={{ href: "http://example", target: "_self" }}>
        <WidgetIcon icon={FakeIcon} />
        <PrimaryText>P</PrimaryText>
        <SecondaryText>S</SecondaryText>
        <Raw>
          <div data-testid="bottom">B</div>
        </Raw>
      </Container>,
      { settings: { target: "_blank" } },
    );

    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("http://example");
    expect(link.getAttribute("target")).toBe("_self");
    expect(screen.getByTestId("fake-icon")).toBeInTheDocument();
    expect(screen.getByText("P")).toBeInTheDocument();
    expect(screen.getByText("S")).toBeInTheDocument();
    expect(screen.getByTestId("bottom")).toBeInTheDocument();
  });

  it("renders only bottom content when children are a single Raw element", () => {
    const { container } = renderWithProviders(
      <Container options={{}}>
        <Raw>
          <div data-testid="only-bottom">B</div>
        </Raw>
      </Container>,
      { settings: { target: "_self" } },
    );

    expect(container.querySelector(".widget-inner")).toBeNull();
    expect(screen.getByTestId("only-bottom")).toBeInTheDocument();
  });

  it("does not crash when clicked (href case is normal link)", () => {
    renderWithProviders(
      <Container options={{ href: "http://example" }}>
        <Raw>
          <div>Bottom</div>
        </Raw>
      </Container>,
      { settings: { target: "_self" } },
    );
  });
});
