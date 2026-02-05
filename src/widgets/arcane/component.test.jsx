// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

function expectBlockValue(container, label, value) {
  const blocks = Array.from(container.querySelectorAll(".service-block"));
  const block = blocks.find((b) => b.textContent?.includes(label));
  expect(block, `missing block for ${label}`).toBeTruthy();
  expect(block.textContent).toContain(String(value));
}

describe("widgets/arcane/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an environment required error when env is missing", () => {
    renderWithProviders(<Component service={{ widget: { type: "arcane" } }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI).not.toHaveBeenCalled();
    expect(screen.getByText("arcane.environment_required")).toBeInTheDocument();
  });

  it("renders placeholders while loading data", () => {
    useWidgetAPI.mockImplementation(() => ({ data: undefined, error: undefined }));

    const { container } = renderWithProviders(<Component service={{ widget: { type: "arcane", env: "prod" } }} />, {
      settings: { hideErrors: false },
    });

    // defaults to the first four fields when none are provided
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("docker.running")).toBeInTheDocument();
    expect(screen.getByText("dockhand.stopped")).toBeInTheDocument();
    expect(screen.getByText("dockhand.total")).toBeInTheDocument();
    expect(screen.getByText("arcane.image_updates")).toBeInTheDocument();
  });

  it("renders values when API data is available", () => {
    useWidgetAPI.mockImplementation((widget, endpoint) => {
      if (endpoint === "containers") {
        return { data: { runningContainers: 3, totalContainers: 5, stoppedContainers: 2 }, error: undefined };
      }
      if (endpoint === "images") {
        return { data: { totalImages: 7, imagesInuse: 4, imagesUnused: 3 }, error: undefined };
      }
      if (endpoint === "updates") {
        return { data: { imagesWithUpdates: 2 }, error: undefined };
      }
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "arcane", env: "prod" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "docker.running", 3);
    expectBlockValue(container, "dockhand.stopped", 2);
    expectBlockValue(container, "dockhand.total", 5);
    expectBlockValue(container, "arcane.image_updates", 2);
  });
});
