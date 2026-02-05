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

describe("widgets/azuredevops/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockImplementation(() => ({ data: undefined, error: undefined }));

    const { container } = renderWithProviders(<Component service={{ widget: { type: "azuredevops" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("azuredevops.result")).toBeInTheDocument();
    expect(screen.getByText("azuredevops.totalPrs")).toBeInTheDocument();
    expect(screen.getByText("azuredevops.myPrs")).toBeInTheDocument();
    expect(screen.getByText("azuredevops.approved")).toBeInTheDocument();
  });

  it("renders pipeline result without PR blocks when includePR is false", () => {
    useWidgetAPI.mockImplementation((widget, endpoint) => {
      if (endpoint === null) return { data: undefined, error: undefined };
      if (endpoint === "pipeline")
        return { data: { value: [{ result: "succeeded", status: "completed" }] }, error: undefined };
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "azuredevops" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(1);
    expectBlockValue(container, "azuredevops.result", "azuredevops.succeeded");
  });

  it("renders pipeline status and PR aggregates when includePR is true", () => {
    useWidgetAPI.mockImplementation((widget, endpoint) => {
      if (endpoint === "pipeline") return { data: { value: [{ status: "inProgress" }] }, error: undefined };
      if (endpoint === "pr")
        return {
          data: {
            count: 3,
            value: [
              { createdBy: { uniqueName: "me@example.com" }, reviewers: [{ vote: 5 }] },
              { createdBy: { uniqueName: "me@example.com" }, reviewers: [{ vote: 0 }] },
              { createdBy: { uniqueName: "other@example.com" }, reviewers: [{ vote: 10 }] },
            ],
          },
          error: undefined,
        };
      return { data: undefined, error: undefined };
    });

    const service = {
      widget: { type: "azuredevops", userEmail: "me@example.com", repositoryId: "repo1" },
    };

    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "azuredevops.status", "azuredevops.inProgress");
    expectBlockValue(container, "azuredevops.totalPrs", 3);
    expectBlockValue(container, "azuredevops.myPrs", 2);
    expectBlockValue(container, "azuredevops.approved", 1);
  });

  it("renders PR error message when PR call returns an errorCode", () => {
    useWidgetAPI.mockImplementation((widget, endpoint) => {
      if (endpoint === "pipeline") return { data: { value: [{ result: "succeeded" }] }, error: undefined };
      if (endpoint === "pr") return { data: { errorCode: 1, message: "Bad PR" }, error: undefined };
      return { data: undefined, error: undefined };
    });

    const service = { widget: { type: "azuredevops", userEmail: "me@example.com", repositoryId: "repo1" } };
    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(screen.getByText("Bad PR")).toBeInTheDocument();
  });
});
