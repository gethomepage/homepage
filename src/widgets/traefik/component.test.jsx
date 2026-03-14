// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/traefik/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "traefik" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("traefik.routers")).toBeInTheDocument();
    expect(screen.getByText("traefik.services")).toBeInTheDocument();
    expect(screen.getByText("traefik.middleware")).toBeInTheDocument();
  });

  it("renders totals when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: { http: { routers: { total: 1 }, services: { total: 2 }, middlewares: { total: 3 } } },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "traefik" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "traefik.routers", 1);
    expectBlockValue(container, "traefik.services", 2);
    expectBlockValue(container, "traefik.middleware", 3);
  });
});
