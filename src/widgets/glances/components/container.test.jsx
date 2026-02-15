// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

import Container from "./container";

describe("widgets/glances/components/container", () => {
  it("renders children and chart spacing when not in error state", () => {
    renderWithProviders(
      <Container chart>
        <div>child</div>
      </Container>,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByText("child")).toBeInTheDocument();
    expect(document.querySelector(".service-container")).toBeTruthy();
    expect(document.querySelector(".h-\\[68px\\]")).toBeTruthy();
  });

  it("renders nothing when error is present and errors are hidden", () => {
    const { container } = renderWithProviders(<Container error={{ message: "nope" }} widget={{ hideErrors: true }} />, {
      settings: { hideErrors: true },
    });
    expect(container.firstChild).toBeNull();
  });

  it("renders the error message when error is present and errors are not hidden", () => {
    renderWithProviders(<Container error={{ message: "nope" }} widget={{ hideErrors: false }} />, {
      settings: { hideErrors: false },
    });
    expect(screen.getByText("widget.api_error")).toBeInTheDocument();
  });
});
