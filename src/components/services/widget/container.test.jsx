// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

import Container from "./container";

function Dummy({ label }) {
  return <div data-testid={label} />;
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
});
