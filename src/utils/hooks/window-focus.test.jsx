// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import useWindowFocus from "./window-focus";

function Fixture() {
  const focused = useWindowFocus();
  return <div data-testid="focused">{String(focused)}</div>;
}

describe("utils/hooks/window-focus", () => {
  it("tracks focus/blur events", async () => {
    vi.spyOn(document, "hasFocus").mockReturnValue(true);

    render(<Fixture />);

    expect(screen.getByTestId("focused")).toHaveTextContent("true");

    window.dispatchEvent(new Event("blur"));
    await waitFor(() => expect(screen.getByTestId("focused")).toHaveTextContent("false"));

    window.dispatchEvent(new Event("focus"));
    await waitFor(() => expect(screen.getByTestId("focused")).toHaveTextContent("true"));
  });
});
