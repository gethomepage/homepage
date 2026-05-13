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
        {services?.map((s, i) => (
          <a key={i} href={s.url}>
            {s.name}
          </a>
        ))}
      </div>
    );
  },
}));

import { fireEvent } from "@testing-library/react";
import ServicesGroup from "./group";

describe("components/services/group", () => {
  it("renders group and subgroup headers", () => {
    render(
      <ServicesGroup
        group={{
          name: "Main",
          services: [{ name: "svc", url: "https://example.com" }],
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

  it("opens all links when 'Open All' is clicked", () => {
    const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => ({}));
    const stopPropagationSpy = vi.fn();

    render(
      <ServicesGroup
        group={{
          name: "Main",
          services: [
            { name: "S1", url: "https://s1.com" },
            { name: "S2", url: "https://s2.com" },
          ],
          groups: [
            {
              name: "Sub",
              services: [{ name: "S3", url: "https://s3.com" }],
              groups: [],
            },
          ],
        }}
        groupsInitiallyCollapsed={false}
      />,
    );

    const openAllBtn = screen.getAllByText("Open All")[0];
    fireEvent.click(openAllBtn, { stopPropagation: stopPropagationSpy });

    expect(windowOpenSpy).toHaveBeenCalledTimes(3);
    expect(windowOpenSpy).toHaveBeenCalledWith("https://s1.com/", "_blank", "noopener,noreferrer");
    expect(windowOpenSpy).toHaveBeenCalledWith("https://s2.com/", "_blank", "noopener,noreferrer");
    expect(windowOpenSpy).toHaveBeenCalledWith("https://s3.com/", "_blank", "noopener,noreferrer");

    windowOpenSpy.mockRestore();
  });
});
