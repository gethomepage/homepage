import { createRequire } from "node:module";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const i18nextConfig = require("../../next-i18next.config.js");

function getRelativeDateFormatter() {
  let relativeDateFormatter;

  i18nextConfig.use[0].init({
    services: {
      formatter: {
        add(name, formatter) {
          if (name === "relativeDate") relativeDateFormatter = formatter;
        },
      },
    },
  });

  return relativeDateFormatter;
}

describe("relativeDate formatter", () => {
  const formatRelativeDate = getRelativeDateFormatter();
  const options = { numeric: "auto" };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 23, 16, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ["hours away on the same day", new Date(2026, 8, 23, 20, 0), "in 4 hours"],
    ["next calendar day", new Date(2026, 8, 24, 20, 0), "tomorrow"],
    ["two calendar days away but under 48h", new Date(2026, 8, 25, 10, 40), "in 2 days"],
    ["previous calendar day", new Date(2026, 8, 22, 10, 0), "yesterday"],
    ["two calendar days ago but under 48h", new Date(2026, 8, 21, 20, 0), "2 days ago"],
  ])("formats %s", (_description, value, expected) => {
    expect(formatRelativeDate(value.toISOString(), "en", options)).toBe(expected);
  });
});
