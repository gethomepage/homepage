// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it } from "vitest";

import { TabContext, TabProvider } from "./tab";

function Reader() {
  const { activeTab, setActiveTab } = useContext(TabContext);
  return (
    <div>
      <div data-testid="value">{String(activeTab)}</div>
      <button type="button" onClick={() => setActiveTab("next")}>
        next
      </button>
    </div>
  );
}

describe("utils/contexts/tab", () => {
  it("provides initial tab and allows updates", () => {
    render(
      <TabProvider initialTab="first">
        <Reader />
      </TabProvider>,
    );

    expect(screen.getByTestId("value")).toHaveTextContent("first");
    fireEvent.click(screen.getByRole("button", { name: "next" }));
    expect(screen.getByTestId("value")).toHaveTextContent("next");
  });
});
