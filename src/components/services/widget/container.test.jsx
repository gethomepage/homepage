// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

import Container from "./container";
import { BlockHighlightContext } from "./highlight-context";

function Dummy({ label }) {
  return <div data-testid={label} />;
}

function HighlightProbe() {
  const value = useContext(BlockHighlightContext);
  return <div data-testid="highlight-probe" data-highlight={value ? "yes" : "no"} />;
}

describe("components/services/widget/container", () => {
  it("filters children based on widget.fields (auto-namespaced by widget type)", () => {
    renderWithProviders(
      <Container service={{ widget: { type: "omada", fields: ["connectedAp", "alerts"] } }}>
        <Dummy label="omada.connectedAp" />
        <Dummy label="omada.alerts" />
        <Dummy label="omada.activeUser" />
      </Container>,
      { settings: {} },
    );

    expect(screen.getByTestId("omada.connectedAp")).toBeInTheDocument();
    expect(screen.getByTestId("omada.alerts")).toBeInTheDocument();
    expect(screen.queryByTestId("omada.activeUser")).toBeNull();
  });

  it("accepts widget.fields as a JSON string", () => {
    renderWithProviders(
      <Container service={{ widget: { type: "omada", fields: JSON.stringify(["alerts"]) } }}>
        <Dummy label="omada.connectedAp" />
        <Dummy label="omada.alerts" />
      </Container>,
      { settings: {} },
    );

    expect(screen.getByTestId("omada.alerts")).toBeInTheDocument();
    expect(screen.queryByTestId("omada.connectedAp")).toBeNull();
  });

  it("supports aliased widget types when filtering (hoarder -> karakeep)", () => {
    renderWithProviders(
      <Container service={{ widget: { type: "hoarder", fields: ["hoarder.count"] } }}>
        <Dummy label="karakeep.count" />
      </Container>,
      { settings: {} },
    );

    expect(screen.getByTestId("karakeep.count")).toBeInTheDocument();
  });

  it("returns null when errors are hidden via settings.hideErrors", () => {
    const { container } = renderWithProviders(
      <Container error="nope" service={{ widget: { type: "omada", hide_errors: false } }}>
        <Dummy label="omada.alerts" />
      </Container>,
      { settings: { hideErrors: true } },
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("skips the highlight provider when highlight levels are fully disabled", () => {
    renderWithProviders(
      <Container service={{ widget: { type: "omada" } }}>
        <HighlightProbe />
      </Container>,
      {
        settings: {
          blockHighlights: { levels: { good: null, warn: null, danger: null } },
        },
      },
    );

    expect(screen.getByTestId("highlight-probe").getAttribute("data-highlight")).toBe("no");
  });
});
