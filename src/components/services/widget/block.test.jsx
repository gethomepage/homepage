// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import Block from "./block";
import { BlockHighlightContext } from "./highlight-context";

import { renderWithProviders } from "test-utils/render-with-providers";

describe("components/services/widget/block", () => {
  it("renders a placeholder when value is undefined", () => {
    const { container } = renderWithProviders(<Block label="some.label" />, { settings: {} });

    // Value slot is rendered as "-" while loading.
    expect(container.textContent).toContain("-");
    expect(container.textContent).toContain("some.label");
  });

  it("sets highlight metadata when a rule matches", () => {
    const highlightConfig = {
      levels: { danger: "danger-class" },
      fields: {
        foo: {
          numeric: { when: "gt", value: 10, level: "danger" },
        },
      },
    };

    const { container } = renderWithProviders(
      <BlockHighlightContext.Provider value={highlightConfig}>
        <Block label="foo.label" field="foo" value="11" />
      </BlockHighlightContext.Provider>,
      { settings: {} },
    );

    const el = container.querySelector(".service-block");
    expect(el).not.toBeNull();
    expect(el.getAttribute("data-highlight-level")).toBe("danger");
    expect(el.className).toContain("danger-class");
  });

  it("uses the standard block styles by default", () => {
    const { container } = renderWithProviders(<Block label="some.label" value="1" />, { settings: {} });

    expect(container.querySelector(".service-block-value").className).toContain("font-thin");
    expect(container.querySelector(".service-block-label").className).toContain("font-bold");
  });

  it("applies refined block styles when blockStyle is set", () => {
    const { container } = renderWithProviders(<Block label="some.label" value="1" />, {
      settings: { blockStyle: "refined" },
    });

    const value = container.querySelector(".service-block-value");
    expect(value.className).toContain("tabular-nums");
    expect(value.className).not.toContain("font-thin");
    expect(container.querySelector(".service-block-label").className).toContain("tracking-wider");
  });

  it("prefers highlightValue over the rendered value for numeric highlighting", () => {
    const highlightConfig = {
      levels: { warn: "warn-class" },
      fields: {
        foo: {
          numeric: { when: "gt", value: 5, level: "warn" },
        },
      },
    };

    const { container } = renderWithProviders(
      <BlockHighlightContext.Provider value={highlightConfig}>
        <Block label="foo.label" field="foo" value="5.791 ms" highlightValue={5.791} />
      </BlockHighlightContext.Provider>,
      { settings: {} },
    );

    const el = container.querySelector(".service-block");
    expect(el).not.toBeNull();
    expect(el.getAttribute("data-highlight-level")).toBe("warn");
    expect(el.className).toContain("warn-class");
  });
});
