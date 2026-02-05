// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { UsageBar } = vi.hoisted(() => ({
  UsageBar: vi.fn(({ percent }) => <div data-testid="usagebar" data-percent={String(percent)} />),
}));

vi.mock("../resources/usage-bar", () => ({
  default: UsageBar,
}));

import Resource from "./resource";

function FakeIcon(props) {
  return <svg data-testid="resource-icon" {...props} />;
}

describe("components/widgets/widget/resource", () => {
  it("renders icon/value/label and shows usage bar when percentage is set", () => {
    render(<Resource icon={FakeIcon} value="v" label="l" percentage={0} />);

    expect(screen.getByTestId("resource-icon")).toBeInTheDocument();
    expect(screen.getByText("v")).toBeInTheDocument();
    expect(screen.getByText("l")).toBeInTheDocument();
    expect(screen.getByTestId("usagebar").getAttribute("data-percent")).toBe("0");
  });

  it("renders expanded values when expanded", () => {
    render(
      <Resource icon={FakeIcon} value="v" label="l" expanded expandedValue="ev" expandedLabel="el" percentage={10} />,
    );

    expect(screen.getByText("ev")).toBeInTheDocument();
    expect(screen.getByText("el")).toBeInTheDocument();
  });
});
