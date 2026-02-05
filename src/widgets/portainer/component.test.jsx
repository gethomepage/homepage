// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { findServiceBlockByLabel } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

function expectBlockValue(container, label, value) {
  const block = findServiceBlockByLabel(container, label);
  expect(block, `missing block for ${label}`).toBeTruthy();
  expect(block.textContent).toContain(String(value));
}

describe("widgets/portainer/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields for non-kubernetes and renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "portainer", kubernetes: false } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["running", "stopped", "total"]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("portainer.running")).toBeInTheDocument();
    expect(screen.getByText("portainer.stopped")).toBeInTheDocument();
    expect(screen.getByText("portainer.total")).toBeInTheDocument();
  });

  it("renders running/stopped/total when container list is loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: [{ State: "running" }, { State: "running" }, { State: "exited" }],
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "portainer" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "portainer.running", 2);
    expectBlockValue(container, "portainer.stopped", 1);
    expectBlockValue(container, "portainer.total", 3);
  });

  it("renders kubernetes placeholders when enabled", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "portainer", kubernetes: true } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["applications", "services", "namespaces"]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("portainer.applications")).toBeInTheDocument();
    expect(screen.getByText("portainer.services")).toBeInTheDocument();
    expect(screen.getByText("portainer.namespaces")).toBeInTheDocument();
  });

  it("renders kubernetes counts when loaded", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "kubernetes/applications") return { data: 1, error: undefined };
      if (endpoint === "kubernetes/services") return { data: 2, error: undefined };
      if (endpoint === "kubernetes/namespaces") return { data: 3, error: undefined };
      // container count isn't used in kubernetes mode (endpoint = "" => url null)
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "portainer", kubernetes: true } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    expectBlockValue(container, "portainer.applications", 1);
    expectBlockValue(container, "portainer.services", 2);
    expectBlockValue(container, "portainer.namespaces", 3);
  });
});
