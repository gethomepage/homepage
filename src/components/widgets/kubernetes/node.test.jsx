// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Node from "./node";

describe("components/widgets/kubernetes/node", () => {
  it("renders cluster label when showLabel is enabled", () => {
    const data = { cpu: { percent: 50 }, memory: { free: 123, percent: 10 } };

    const { container } = render(<Node type="cluster" options={{ showLabel: true, label: "Cluster A" }} data={data} />);

    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
    expect(screen.getByText("Cluster A")).toBeInTheDocument();
    expect(container.querySelectorAll('div[style*="width:"]').length).toBeGreaterThan(0);
  });

  it("renders node name when showLabel is enabled for node type", () => {
    const data = { name: "node-1", ready: true, cpu: { percent: 1 }, memory: { free: 2, percent: 3 } };

    render(<Node type="node" options={{ showLabel: true }} data={data} />);

    expect(screen.getByText("node-1")).toBeInTheDocument();
  });

  it("renders a warning icon when the node is not ready", () => {
    const data = { name: "node-2", ready: false, cpu: { percent: 1 }, memory: { free: 2, percent: 3 } };

    render(<Node type="node" options={{ showLabel: true }} data={data} />);

    expect(screen.getByText("node-2")).toBeInTheDocument();
  });
});
