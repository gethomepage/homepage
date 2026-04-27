// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

describe("widgets/ntfy/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockImplementation(() => ({ data: undefined, error: undefined }));

    const { container } = renderWithProviders(<Component service={{ widget: { type: "ntfy" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("ntfy.title")).toBeInTheDocument();
    expect(screen.getByText("ntfy.message")).toBeInTheDocument();
    expect(screen.getByText("ntfy.priority")).toBeInTheDocument();
    expect(screen.getByText("ntfy.lastReceived")).toBeInTheDocument();
  });

  it("renders message data with default fields", () => {
    useWidgetAPI.mockImplementation(() => ({
      data: {
        title: "Disk Alert",
        message: "Disk usage at 90%",
        priority: 4,
        time: 1700000000,
        tags: ["warning"],
      },
      error: undefined,
    }));

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "ntfy", url: "https://ntfy.example.com", topic: "alerts" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "ntfy.title", "Disk Alert");
    expectBlockValue(container, "ntfy.message", "Disk usage at 90%");
    expectBlockValue(container, "ntfy.priority", "ntfy.high");
  });

  it("shows placeholder for title when message has no title set", () => {
    useWidgetAPI.mockImplementation(() => ({
      data: {
        title: null,
        message: "Simple notification",
        priority: 3,
        time: 1700000000,
        tags: [],
      },
      error: undefined,
    }));

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "ntfy", url: "https://ntfy.example.com", topic: "alerts" } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "ntfy.title", "ntfy.none");
    expectBlockValue(container, "ntfy.message", "Simple notification");
    expectBlockValue(container, "ntfy.priority", "ntfy.default");
  });

  it("renders no messages state", () => {
    useWidgetAPI.mockImplementation(() => ({
      data: {
        title: null,
        message: null,
        priority: 3,
        time: null,
        tags: [],
      },
      error: undefined,
    }));

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "ntfy", url: "https://ntfy.example.com", topic: "alerts" } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "ntfy.title", "ntfy.none");
    expectBlockValue(container, "ntfy.message", "ntfy.none");
    expectBlockValue(container, "ntfy.lastReceived", "ntfy.none");
  });

  it("renders error when API fails", () => {
    useWidgetAPI.mockImplementation(() => ({
      data: undefined,
      error: { message: "Request failed" },
    }));

    renderWithProviders(
      <Component service={{ widget: { type: "ntfy", url: "https://ntfy.example.com", topic: "alerts" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByText("Request failed")).toBeInTheDocument();
  });

  it("renders optional tags field when included", () => {
    useWidgetAPI.mockImplementation(() => ({
      data: {
        title: "Alert",
        message: "Test",
        priority: 5,
        time: 1700000000,
        tags: ["warning", "skull"],
      },
      error: undefined,
    }));

    const service = {
      widget: {
        type: "ntfy",
        url: "https://ntfy.example.com",
        topic: "alerts",
        fields: ["title", "priority", "lastReceived", "tags"],
      },
    };

    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expectBlockValue(container, "ntfy.tags", "warning, skull");
    expectBlockValue(container, "ntfy.priority", "ntfy.urgent");
  });

  it("caps visible blocks at 4 when more than 4 fields are configured", () => {
    useWidgetAPI.mockImplementation(() => ({
      data: {
        title: "Alert",
        message: "Body",
        priority: 3,
        time: 1700000000,
        tags: ["a"],
      },
      error: undefined,
    }));

    const service = {
      widget: {
        type: "ntfy",
        url: "https://ntfy.example.com",
        topic: "alerts",
        fields: ["title", "message", "priority", "lastReceived", "tags"],
      },
    };

    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
  });

  it("falls back to default priority label when priority is out of range", () => {
    useWidgetAPI.mockImplementation(() => ({
      data: {
        title: "Alert",
        message: "Body",
        priority: 99,
        time: 1700000000,
        tags: [],
      },
      error: undefined,
    }));

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "ntfy", url: "https://ntfy.example.com", topic: "alerts" } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "ntfy.priority", "ntfy.default");
  });

  it("renders optional message field when included", () => {
    useWidgetAPI.mockImplementation(() => ({
      data: {
        title: "Disk Alert",
        message: "Disk usage at 90%",
        priority: 4,
        time: 1700000000,
        tags: [],
      },
      error: undefined,
    }));

    const service = {
      widget: {
        type: "ntfy",
        url: "https://ntfy.example.com",
        topic: "alerts",
        fields: ["title", "priority", "message"],
      },
    };

    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expectBlockValue(container, "ntfy.title", "Disk Alert");
    expectBlockValue(container, "ntfy.message", "Disk usage at 90%");
  });
});
