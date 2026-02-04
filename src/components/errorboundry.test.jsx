// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ErrorBoundary from "./errorboundry";

describe("components/errorboundry", () => {
  it("renders children when no error is thrown", () => {
    render(
      <ErrorBoundary>
        <div>ok</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText("ok")).toBeInTheDocument();
  });

  it("renders a fallback UI when a child throws", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const Boom = () => {
        throw new Error("boom");
      };

      render(
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
      expect(screen.getByText("Error: boom")).toBeInTheDocument();
    } finally {
      consoleSpy.mockRestore();
    }
  });
});
