// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { Resource } = vi.hoisted(() => ({
  Resource: vi.fn(({ children }) => <div data-testid="lh-resource">{children}</div>),
}));

vi.mock("../widget/resource", () => ({
  default: Resource,
}));

vi.mock("../widget/widget_label", () => ({
  default: ({ label }) => <div data-testid="lh-label">{label}</div>,
}));

import Node from "./node";

describe("components/widgets/longhorn/node", () => {
  it("passes calculated percentage and renders label when enabled", () => {
    const data = { node: { id: "n1", available: 25, maximum: 100 } };

    render(<Node data={{ node: data.node }} expanded labels />);

    expect(Resource).toHaveBeenCalledTimes(1);
    const callProps = Resource.mock.calls[0][0];
    expect(callProps.percentage).toBe(75);
    expect(callProps.expanded).toBe(true);
    expect(screen.getByTestId("lh-label")).toHaveTextContent("n1");
  });
});
