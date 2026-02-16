// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

import Component from "./component";

describe("widgets/iframe/component", () => {
  it("renders an iframe with the configured src/title and classes", () => {
    const service = {
      widget: {
        type: "iframe",
        name: "My Frame",
        src: "http://example.test",
        classes: "h-10 w-10",
        allowScrolling: "no",
      },
    };

    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    const iframe = container.querySelector("iframe");
    expect(iframe).toBeTruthy();
    expect(iframe.getAttribute("src")).toBe("http://example.test");
    expect(iframe.getAttribute("title")).toBe("My Frame");
    expect(iframe.getAttribute("name")).toBe("My Frame");
    expect(iframe.getAttribute("scrolling")).toBe("no");
    expect(iframe.className).toContain("h-10 w-10");
  });
});
