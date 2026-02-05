// @vitest-environment jsdom

import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@headlessui/react", async () => {
  const React = await import("react");
  const { Fragment, useEffect } = React;

  function Transition({ as: As = Fragment, beforeEnter, beforeLeave, children }) {
    useEffect(() => {
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
          if (node) Object.defineProperty(node, "scrollHeight", { value: 50, configurable: true });
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

vi.mock("components/bookmarks/list", () => ({
  default: function BookmarksListMock() {
    return <div data-testid="bookmarks-list" />;
  },
}));

vi.mock("components/errorboundry", () => ({
  default: function ErrorBoundaryMock({ children }) {
    return <>{children}</>;
  },
}));

vi.mock("components/resolvedicon", () => ({
  default: function ResolvedIconMock() {
    return <div data-testid="resolved-icon" />;
  },
}));

import BookmarksGroup from "./group";

describe("components/bookmarks/group transition hooks", () => {
  it("runs the Transition beforeEnter/beforeLeave height calculations and applies maxGroupColumns", async () => {
    vi.useFakeTimers();

    render(
      <BookmarksGroup
        bookmarks={{ name: "Bookmarks", bookmarks: [] }}
        layout={{ initiallyCollapsed: false }}
        groupsInitiallyCollapsed={false}
        maxGroupColumns="7"
      />,
    );

    const wrapper = screen.getByText("Bookmarks").closest(".bookmark-group");
    expect(wrapper?.className).toContain("3xl:basis-1/7");

    const panel = screen.getByTestId("disclosure-panel");
    await act(async () => {
      vi.runAllTimers();
    });

    expect(panel.style.height).toBe("0px");

    vi.useRealTimers();
  });
});
