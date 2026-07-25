// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@headlessui/react", async () => {
  const React = await import("react");
  const { Fragment } = React;

  function Transition({ as: As = Fragment, children }) {
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
    return <div ref={ref} data-testid="disclosure-panel" {...props} static="true" />;
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
  default: function ServicesListMock({ groupName, services }) {
    return (
      <div data-testid="services-list-mock">
        {groupName}:{services?.length ?? 0}
      </div>
    );
  },
}));

import ServicesGroup from "./group";

describe("components/services/group", () => {
  it("renders group and subgroup headers", () => {
    render(
      <ServicesGroup
        group={{
          name: "Main",
          services: [{ name: "svc" }],
          groups: [{ name: "Sub", services: [], groups: [] }],
        }}
        layout={{ icon: "mdi:test" }}
        groupsInitiallyCollapsed={false}
      />,
    );

    expect(screen.getByText("Main")).toBeInTheDocument();
    expect(screen.getByTestId("resolved-icon")).toBeInTheDocument();
    const lists = screen.getAllByTestId("services-list-mock");
    expect(lists[0]).toHaveTextContent("Main:1");
    expect(screen.getByText("Sub")).toBeInTheDocument();
  });

  it("renders data-group attribute on the group wrapper div", () => {
    const { container } = render(
      <ServicesGroup
        group={{ name: "My Services", services: [], groups: [] }}
        layout={{}}
        groupsInitiallyCollapsed={false}
      />,
    );

    const groupDiv = container.querySelector('[data-group="My Services"]');
    expect(groupDiv).toBeInTheDocument();
    expect(groupDiv).toHaveClass("services-group");
  });

  it("renders data-group attribute on subgroups", () => {
    const { container } = render(
      <ServicesGroup
        group={{
          name: "Main",
          services: [],
          groups: [{ name: "SubGroup", services: [], groups: [] }],
        }}
        layout={{}}
        groupsInitiallyCollapsed={false}
      />,
    );

    const mainDiv = container.querySelector('[data-group="Main"]');
    expect(mainDiv).toBeInTheDocument();
    const subDiv = container.querySelector('[data-group="SubGroup"]');
    expect(subDiv).toBeInTheDocument();
  });

  it("handles empty group name in data-group", () => {
    const { container } = render(
      <ServicesGroup
        group={{ name: "", services: [], groups: [] }}
        layout={{}}
        groupsInitiallyCollapsed={false}
      />,
    );

    const groupDiv = container.querySelector('[data-group=""]');
    expect(groupDiv).toBeInTheDocument();
  });

  it("handles special characters in group name", () => {
    const { container } = render(
      <ServicesGroup
        group={{ name: "Group & Co.", services: [], groups: [] }}
        layout={{}}
        groupsInitiallyCollapsed={false}
      />,
    );

    const groupDivs = container.querySelectorAll(".services-group");
    const found = Array.from(groupDivs).find((el) => el.getAttribute("data-group") === "Group & Co.");
    expect(found).toBeTruthy();
  });

  it("renders custom data-* attributes from layout.data", () => {
    const { container } = render(
      <ServicesGroup
        group={{ name: "Test", services: [], groups: [] }}
        layout={{ data: { foo: "bar", baz: "qux" } }}
        groupsInitiallyCollapsed={false}
      />,
    );

    const groupDiv = container.querySelector('[data-group="Test"]');
    expect(groupDiv).toHaveAttribute("data-foo", "bar");
    expect(groupDiv).toHaveAttribute("data-baz", "qux");
  });

  it("does not add unexpected data-* attributes when layout.data is empty", () => {
    const { container } = render(
      <ServicesGroup
        group={{ name: "Test", services: [], groups: [] }}
        layout={{ data: {} }}
        groupsInitiallyCollapsed={false}
      />,
    );

    const groupDiv = container.querySelector('[data-group="Test"]');
    // Should have data-group but not data-foo
    expect(groupDiv).toHaveAttribute("data-group", "Test");
    expect(groupDiv).not.toHaveAttribute("data-foo");
  });

  it("renders layout.class on the group wrapper", () => {
    const { container } = render(
      <ServicesGroup
        group={{ name: "Test", services: [], groups: [] }}
        layout={{ class: "my-custom-class" }}
        groupsInitiallyCollapsed={false}
      />,
    );

    const groupDiv = container.querySelector('[data-group="Test"]');
    expect(groupDiv).toHaveClass("my-custom-class");
  });

  it("layout.class merges with default classes", () => {
    const { container } = render(
      <ServicesGroup
        group={{ name: "Test", services: [], groups: [] }}
        layout={{ class: "my-custom-class" }}
        groupsInitiallyCollapsed={false}
      />,
    );

    const groupDiv = container.querySelector('[data-group="Test"]');
    expect(groupDiv).toHaveClass("services-group");
    expect(groupDiv).toHaveClass("flex-1");
    expect(groupDiv).toHaveClass("my-custom-class");
  });

  it("handles undefined layout without error", () => {
    const { container } = render(
      <ServicesGroup
        group={{ name: "Test", services: [], groups: [] }}
        groupsInitiallyCollapsed={false}
      />,
    );

    const groupDiv = container.querySelector('[data-group="Test"]');
    expect(groupDiv).toBeInTheDocument();
    expect(groupDiv).toHaveClass("services-group");
  });

  it("sets the panel height to 0 when initially collapsed", async () => {
    render(
      <ServicesGroup
        group={{ name: "Main", services: [], groups: [] }}
        layout={{ initiallyCollapsed: true }}
        groupsInitiallyCollapsed={false}
      />,
    );

    const panel = screen.getAllByTestId("disclosure-panel")[0];
    await waitFor(() => {
      expect(panel.style.height).toBe("0px");
    });
  });
});
