// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Error from "./error";

describe("components/services/widget/error", () => {
  it("normalizes string errors to an object with a message", () => {
    render(<Error error="boom" />);

    expect(screen.getByText((_, el) => el?.textContent === "widget.api_error:")).toBeInTheDocument();
    expect(screen.getByText(/boom/)).toBeInTheDocument();
  });

  it("normalizes numeric errors to an object with a message", () => {
    render(<Error error={500} />);

    expect(screen.getByText(/Error 500/)).toBeInTheDocument();
  });

  it("unwraps nested response errors and renders raw/data sections", () => {
    render(
      <Error
        error={{
          message: "outer",
          data: {
            error: {
              message: "inner",
              url: "https://example.com",
              rawError: ["oops", { code: 1 }],
              data: { type: "Buffer", data: [97, 98] },
            },
          },
        }}
      />,
    );

    expect(screen.getByText(/inner/)).toBeInTheDocument();
    expect(screen.getByText("https://example.com")).toBeInTheDocument();
    expect(screen.getByText(/\"code\": 1/)).toBeInTheDocument();
    // Buffer.from({type:"Buffer",data:[97,98]}).toString() === "ab"
    expect(screen.getByText(/ab/)).toBeInTheDocument();
  });
});
