// @vitest-environment jsdom

import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

vi.mock("next/dynamic", () => ({
  default: () => (props) => (
    <div
      data-testid="calendar-integration"
      data-type={props.config.type}
      data-start={props.params.start}
      data-end={props.params.end}
      data-timezone={props.timezone || ""}
    />
  ),
}));

vi.mock("./monthly", () => ({
  default: ({ showDate }) => <div data-testid="calendar-monthly" data-show={showDate?.toISODate?.() || ""} />,
}));

vi.mock("./agenda", () => ({
  default: ({ showDate }) => <div data-testid="calendar-agenda" data-show={showDate?.toISODate?.() || ""} />,
}));

import Component from "./component";

describe("widgets/calendar/component", () => {
  it("renders monthly view by default", async () => {
    renderWithProviders(<Component service={{ widget: { type: "calendar", integrations: [] } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByTestId("calendar-monthly")).toBeInTheDocument();
    expect(screen.queryByTestId("calendar-agenda")).toBeNull();

    // showDate is set asynchronously in an effect; ensure it eventually resolves to a date string.
    await waitFor(() => {
      expect(screen.getByTestId("calendar-monthly").getAttribute("data-show")).not.toBe("");
    });
  });

  it("renders agenda view when configured", async () => {
    renderWithProviders(<Component service={{ widget: { type: "calendar", view: "agenda", integrations: [] } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByTestId("calendar-agenda")).toBeInTheDocument();
    expect(screen.queryByTestId("calendar-monthly")).toBeNull();

    await waitFor(() => {
      expect(screen.getByTestId("calendar-agenda").getAttribute("data-show")).not.toBe("");
    });
  });

  it("loads configured integrations and passes calculated params", async () => {
    renderWithProviders(
      <Component
        service={{
          widget: {
            type: "calendar",
            timezone: "UTC",
            integrations: [
              {
                type: "sonarr",
                name: "Sonarr",
                service_group: "Media",
                service_name: "Sonarr",
              },
            ],
          },
        }}
      />,
      { settings: { hideErrors: false } },
    );

    const integration = screen.getByTestId("calendar-integration");
    expect(integration.getAttribute("data-type")).toBe("sonarr");
    expect(integration.getAttribute("data-timezone")).toBe("UTC");

    await waitFor(() => {
      // start/end should be yyyy-MM-dd after showDate is set.
      expect(integration.getAttribute("data-start")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(integration.getAttribute("data-end")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
