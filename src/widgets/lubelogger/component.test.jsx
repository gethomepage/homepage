// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { findServiceBlockByLabel } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

function expectBlockValue(container, label, value) {
  const block = findServiceBlockByLabel(container, label);
  expect(block, `missing block for ${label}`).toBeTruthy();
  expect(block.textContent).toContain(String(value));
}

describe("widgets/lubelogger/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "lubelogger", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("lubelogger.vehicles")).toBeInTheDocument();
    expect(screen.getByText("lubelogger.serviceRecords")).toBeInTheDocument();
    expect(screen.getByText("lubelogger.reminders")).toBeInTheDocument();
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "lubelogger", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("filters to vehicleID and renders next reminder details when found", () => {
    useWidgetAPI.mockReturnValue({
      data: [
        {
          vehicleData: { id: 1, year: 2020, model: "Model A" },
          veryUrgentReminderCount: 1,
          urgentReminderCount: 2,
          notUrgentReminderCount: 3,
          serviceRecordCount: 5,
          nextReminder: { dueDate: 123 },
        },
        {
          vehicleData: { id: 2, year: 2021, model: "Model B" },
          veryUrgentReminderCount: 0,
          urgentReminderCount: 0,
          notUrgentReminderCount: 0,
          serviceRecordCount: 1,
          nextReminder: null,
        },
      ],
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "lubelogger", url: "http://x", vehicleID: 1 } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "lubelogger.vehicle", "2020 Model A");
    expectBlockValue(container, "lubelogger.serviceRecords", 5);
    expectBlockValue(container, "lubelogger.reminders", 6);
    expectBlockValue(container, "lubelogger.nextReminder", 123);
  });

  it("shows an error when vehicleID is set but not found", () => {
    useWidgetAPI.mockReturnValue({
      data: [
        {
          vehicleData: { id: 2, year: 2021, model: "Model B" },
          veryUrgentReminderCount: 0,
          urgentReminderCount: 0,
          notUrgentReminderCount: 0,
          serviceRecordCount: 0,
        },
      ],
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "lubelogger", url: "http://x", vehicleID: 1 } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Vehicle not found")).toBeInTheDocument();
  });
});
