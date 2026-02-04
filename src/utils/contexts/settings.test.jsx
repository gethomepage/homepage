// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it } from "vitest";

import { SettingsContext, SettingsProvider } from "./settings";

function Reader() {
  const { settings, setSettings } = useContext(SettingsContext);
  return (
    <div>
      <div data-testid="value">{JSON.stringify(settings)}</div>
      <button type="button" onClick={() => setSettings({ updated: true })}>
        update
      </button>
    </div>
  );
}

describe("utils/contexts/settings", () => {
  it("provides initial settings and allows updates", () => {
    render(
      <SettingsProvider initialSettings={{ a: 1 }}>
        <Reader />
      </SettingsProvider>,
    );

    expect(screen.getByTestId("value")).toHaveTextContent('{"a":1}');
    fireEvent.click(screen.getByRole("button", { name: "update" }));
    expect(screen.getByTestId("value")).toHaveTextContent('{"updated":true}');
  });
});
