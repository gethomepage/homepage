import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  // Node-environment tests shouldn't require jsdom; guard cleanup accordingly.
  if (typeof document !== "undefined") cleanup();
});

// implement a couple of common formatters mocked in next-i18next
vi.mock("next-i18next", () => ({
  // Keep app/page components importable in unit tests.
  appWithTranslation: (Component) => Component,
  useTranslation: () => ({
    i18n: { language: "en" },
    t: (key, opts) => {
      if (key === "common.number") return String(opts?.value ?? "");
      if (key === "common.percent") return String(opts?.value ?? "");
      if (key === "common.bytes") return String(opts?.value ?? "");
      if (key === "common.bbytes") return String(opts?.value ?? "");
      if (key === "common.byterate") return String(opts?.value ?? "");
      if (key === "common.bibyterate") return String(opts?.value ?? "");
      if (key === "common.bitrate") return String(opts?.value ?? "");
      if (key === "common.duration") return String(opts?.value ?? "");
      if (key === "common.ms") return String(opts?.value ?? "");
      if (key === "common.date") return String(opts?.value ?? "");
      if (key === "common.relativeDate") return String(opts?.value ?? "");
      return key;
    },
  }),
}));
