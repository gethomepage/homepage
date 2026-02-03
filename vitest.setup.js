import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

// implement a couple of common formatters mocked in next-i18next
vi.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts) => {
      if (key === "common.number") return String(opts?.value ?? "");
      if (key === "common.percent") return String(opts?.value ?? "");
      return key;
    },
  }),
}));
