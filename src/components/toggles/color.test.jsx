// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ColorContext } from "utils/contexts/color";

// Stub Popover/Transition to always render children.
vi.mock("@headlessui/react", async () => {
  const React = await import("react");
  const { Fragment } = React;

  function passthrough({ as: As = "div", children, ...props }) {
    if (As === Fragment) return <>{typeof children === "function" ? children({ open: true }) : children}</>;
    const content = typeof children === "function" ? children({ open: true }) : children;
    return <As {...props}>{content}</As>;
  }

  function Popover({ children }) {
    return <div>{typeof children === "function" ? children({ open: true }) : children}</div>;
  }
  function PopoverButton(props) {
    return <button type="button" {...props} />;
  }
  function PopoverPanel(props) {
    return <div {...props} />;
  }
  Popover.Button = PopoverButton;
  Popover.Panel = PopoverPanel;

  return { Popover, Transition: passthrough };
});

import ColorToggle from "./color";

describe("components/toggles/color", () => {
  it("renders nothing when no active color is set", () => {
    const { container } = render(
      <ColorContext.Provider value={{ color: null, setColor: vi.fn() }}>
        <ColorToggle />
      </ColorContext.Provider>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("invokes setColor when a color button is clicked", () => {
    const setColor = vi.fn();
    render(
      <ColorContext.Provider value={{ color: "slate", setColor }}>
        <ColorToggle />
      </ColorContext.Provider>,
    );

    // Buttons contain a sr-only span with the color name.
    const blue = screen.getByText("blue").closest("button");
    fireEvent.click(blue);
    expect(setColor).toHaveBeenCalledWith("blue");
  });
});
