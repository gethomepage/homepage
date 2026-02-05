// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("components/errorboundry", () => ({
  default: function ErrorBoundaryMock({ children }) {
    return <>{children}</>;
  },
}));

vi.mock("widgets/components", () => ({
  default: {
    mock: function MockWidget({ service }) {
      return (
        <div data-testid="mock-service-widget">
          {service.name}:{service.widget?.type}
        </div>
      );
    },
  },
}));

import Widget from "./widget";

describe("components/services/widget", () => {
  it("renders the mapped widget component and passes merged service.widget", () => {
    render(<Widget widget={{ type: "mock" }} service={{ name: "Svc" }} />);

    expect(screen.getByTestId("mock-service-widget")).toHaveTextContent("Svc:mock");
  });

  it("renders a missing widget message when the type is unknown", () => {
    render(<Widget widget={{ type: "nope" }} service={{ name: "Svc" }} />);

    expect(screen.getByText("widget.missing_type")).toBeInTheDocument();
  });
});
