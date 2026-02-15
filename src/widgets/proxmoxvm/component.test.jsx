// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { findServiceBlockByLabel } from "test-utils/widget-assertions";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));
vi.mock("swr", () => ({ default: useSWR }));

import Component from "./component";

function expectBlockValue(container, label, value) {
  const block = findServiceBlockByLabel(container, label);
  expect(block, `missing block for ${label}`).toBeTruthy();
  expect(block.textContent).toContain(String(value));
}

describe("widgets/proxmoxvm/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "proxmoxvm", node: "n1", vmid: "100" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("resources.cpu")).toBeInTheDocument();
    expect(screen.getByText("resources.mem")).toBeInTheDocument();
  });

  it("renders cpu percent and mem bytes when loaded", () => {
    useSWR.mockReturnValue({ data: { cpu: 0.5, mem: 1024 }, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "proxmoxvm", node: "n1", vmid: "100" } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "resources.cpu", 50);
    expectBlockValue(container, "resources.mem", 1024);
  });
});
