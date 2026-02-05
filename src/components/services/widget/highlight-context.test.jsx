// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useContext } from "react";

import { BlockHighlightContext } from "./highlight-context";

function Reader() {
  const value = useContext(BlockHighlightContext);
  return <div data-testid="value">{value === null ? "null" : value}</div>;
}

describe("components/services/widget/highlight-context", () => {
  it("defaults to null", () => {
    render(<Reader />);
    expect(screen.getByTestId("value")).toHaveTextContent("null");
  });

  it("provides a value to consumers", () => {
    render(
      <BlockHighlightContext.Provider value="on">
        <Reader />
      </BlockHighlightContext.Provider>,
    );
    expect(screen.getByTestId("value")).toHaveTextContent("on");
  });
});
