// @vitest-environment jsdom

import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

vi.mock("components/resolvedicon", () => ({
  default: function ResolvedIconMock() {
    return <div data-testid="resolved-icon" />;
  },
}));

vi.mock("widgets/docker/component", () => ({
  default: function DockerWidgetMock() {
    return <div data-testid="docker-widget" />;
  },
}));

vi.mock("widgets/kubernetes/component", () => ({
  default: function KubernetesWidgetMock() {
    return <div data-testid="kubernetes-widget" />;
  },
}));

vi.mock("widgets/proxmoxvm/component", () => ({
  default: function ProxmoxVMWidgetMock() {
    return <div data-testid="proxmoxvm-widget" />;
  },
}));

vi.mock("./ping", () => ({
  default: function PingMock() {
    return <div data-testid="ping" />;
  },
}));
vi.mock("./site-monitor", () => ({
  default: function SiteMonitorMock() {
    return <div data-testid="site-monitor" />;
  },
}));
vi.mock("./status", () => ({
  default: function StatusMock() {
    return <div data-testid="status" />;
  },
}));
vi.mock("./kubernetes-status", () => ({
  default: function KubernetesStatusMock() {
    return <div data-testid="kubernetes-status" />;
  },
}));
vi.mock("./proxmox-status", () => ({
  default: function ProxmoxStatusMock() {
    return <div data-testid="proxmox-status" />;
  },
}));
vi.mock("./widget", () => ({
  default: function ServiceWidgetMock({ widget }) {
    return <div data-testid="service-widget">idx:{widget.index}</div>;
  },
}));

import Item from "./item";

describe("components/services/item", () => {
  it("renders the service title as a link when href is provided", () => {
    renderWithProviders(
      <Item
        groupName="G"
        useEqualHeights={false}
        service={{
          id: "svc1",
          name: "My Service",
          description: "Desc",
          href: "https://example.com",
          icon: "mdi:test",
          widgets: [],
        }}
      />,
      { settings: { target: "_self", showStats: false, statusStyle: "basic" } },
    );

    const links = screen.getAllByRole("link");
    expect(links.some((l) => l.getAttribute("href") === "https://example.com")).toBe(true);
    expect(screen.getByText("My Service")).toBeInTheDocument();
  });

  it("toggles container stats on click when stats are hidden by default", () => {
    renderWithProviders(
      <Item
        groupName="G"
        useEqualHeights={false}
        service={{
          id: "svc1",
          name: "My Service",
          description: "Desc",
          href: "https://example.com",
          container: "c",
          server: "s",
          ping: true,
          siteMonitor: true,
          widgets: [{ index: 1 }, { index: 2 }],
        }}
      />,
      { settings: { showStats: false, statusStyle: "basic" } },
    );

    expect(screen.queryByTestId("docker-widget")).not.toBeInTheDocument();
    expect(screen.getByTestId("ping")).toBeInTheDocument();
    expect(screen.getByTestId("site-monitor")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "View container stats" }));
    expect(screen.getByTestId("docker-widget")).toBeInTheDocument();

    expect(screen.getAllByTestId("service-widget")).toHaveLength(2);
  });
});
