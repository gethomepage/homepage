// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));

vi.mock("swr", () => ({ default: useSWR }));

vi.mock("./node", () => ({
  default: ({ data }) => <div data-testid="longhorn-node" data-id={data.node.id} />,
}));

import Longhorn from "./longhorn";

describe("components/widgets/longhorn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders an error state when SWR errors", () => {
    useSWR.mockReturnValue({ data: undefined, error: new Error("nope") });

    renderWithProviders(<Longhorn options={{ nodes: true, total: true }} />, { settings: { target: "_self" } });

    expect(screen.getByText("widget.api_error")).toBeInTheDocument();
  });

  it("renders an empty container while loading", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Longhorn options={{ nodes: true, total: true }} />, {
      settings: { target: "_self" },
    });

    expect(container.querySelector(".infomation-widget-longhorn")).not.toBeNull();
    expect(screen.queryAllByTestId("longhorn-node")).toHaveLength(0);
  });

  it("filters nodes based on options (total/include)", () => {
    useSWR.mockReturnValue({
      data: {
        nodes: [{ id: "total" }, { id: "node1" }, { id: "node2" }],
      },
      error: undefined,
    });

    renderWithProviders(
      <Longhorn options={{ nodes: true, total: true, include: ["node1"], expanded: false, labels: false }} />,
      { settings: { target: "_self" } },
    );

    const nodes = screen.getAllByTestId("longhorn-node");
    expect(nodes.map((n) => n.getAttribute("data-id"))).toEqual(["total", "node1"]);
  });

  it("omits non-total nodes when options.nodes is false", () => {
    useSWR.mockReturnValue({
      data: {
        nodes: [{ id: "total" }, { id: "node1" }],
      },
      error: undefined,
    });

    renderWithProviders(<Longhorn options={{ nodes: false, total: true }} />, { settings: { target: "_self" } });

    const nodes = screen.getAllByTestId("longhorn-node");
    expect(nodes.map((n) => n.getAttribute("data-id"))).toEqual(["total"]);
  });
});
