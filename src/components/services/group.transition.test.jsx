// @vitest-environment jsdom

import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@headlessui/react", async () => {
  const React = await import("react");
  const { Fragment, useEffect } = React;

  function Transition({ as: As = Fragment, beforeEnter, beforeLeave, children }) {
    useEffect(() => {
      // Simulate a mount -> enter animation, then a leave animation shortly after.
      beforeEnter?.();
      setTimeout(() => beforeLeave?.(), 200);
    }, [beforeEnter, beforeLeave]);

    if (As === Fragment) return <>{children}</>;
    return <As>{children}</As>;
  }

  function Disclosure({ defaultOpen = true, children }) {
    const content = typeof children === "function" ? children({ open: defaultOpen }) : children;
    return <div>{content}</div>;
  }

  function DisclosureButton(props) {
    return <button type="button" {...props} />;
  }

  const DisclosurePanel = React.forwardRef(function DisclosurePanel(props, ref) {
    const { static: _static, ...rest } = props;
    return (
      <div
        ref={(node) => {
          if (node) {
            // JSDOM doesn't calculate layout; give the panel a deterministic height.
            Object.defineProperty(node, "scrollHeight", { value: 123, configurable: true });
          }
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        data-testid="disclosure-panel"
        {...rest}
      />
    );
  });

  Disclosure.Button = DisclosureButton;
  Disclosure.Panel = DisclosurePanel;

  return { Disclosure, Transition };
});

vi.mock("components/resolvedicon", () => ({
  default: function ResolvedIconMock() {
    return <div data-testid="resolved-icon" />;
  },
}));

vi.mock("components/services/list", () => ({
  default: function ServicesListMock() {
    return <div data-testid="services-list" />;
  },
}));

import ServicesGroup from "./group";

describe("components/services/group transition hooks", () => {
  it("runs the Transition beforeEnter/beforeLeave height calculations", async () => {
    vi.useFakeTimers();

    render(
      <ServicesGroup
        group={{ name: "Main", services: [], groups: [] }}
        layout={{ initiallyCollapsed: false }}
        groupsInitiallyCollapsed={false}
      />,
    );

    const panel = screen.getByTestId("disclosure-panel");
    expect(panel).toBeTruthy();

    await act(async () => {
      vi.runAllTimers();
    });

    // The leave animation sets height back to 0.
    expect(panel.style.height).toBe("0px");

    vi.useRealTimers();
  });
});
