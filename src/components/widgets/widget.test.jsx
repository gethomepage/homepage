// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { dynamic } = vi.hoisted(() => {
  const dynamic = vi.fn((loader, opts) => {
    const loaderStr = loader.toString();
    const ssr = opts?.ssr === false ? "false" : "true";

    return function DynamicWidget({ options }) {
      return (
        <div
          data-testid="dynamic-widget"
          data-loader={loaderStr}
          data-ssr={ssr}
          data-options={JSON.stringify(options)}
        />
      );
    };
  });

  return { dynamic };
});

vi.mock("next/dynamic", () => ({
  default: dynamic,
}));

vi.mock("components/errorboundry", () => ({
  default: ({ children }) => <div data-testid="error-boundary">{children}</div>,
}));

import Widget from "./widget";

describe("components/widgets/widget", () => {
  it("renders the mapped widget component and forwards style into options", () => {
    render(
      <Widget widget={{ type: "search", options: { provider: ["google"] } }} style={{ header: "boxedWidgets" }} />,
    );

    const boundary = screen.getByTestId("error-boundary");
    expect(boundary).toBeInTheDocument();

    const el = screen.getByTestId("dynamic-widget");
    expect(el.getAttribute("data-loader")).toContain("search/search");

    const forwarded = JSON.parse(el.getAttribute("data-options"));
    expect(forwarded.provider).toEqual(["google"]);
    expect(forwarded.style).toEqual({ header: "boxedWidgets" });
  });

  it("renders a missing message when widget type is unknown", () => {
    render(<Widget widget={{ type: "nope", options: {} }} style={{}} />);
    expect(screen.getByText("Missing")).toBeInTheDocument();
    expect(screen.getByText("nope")).toBeInTheDocument();
  });
});
