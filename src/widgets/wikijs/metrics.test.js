import { describe, expect, it } from "vitest";

import { parseWikiJsMetrics } from "./metrics";

describe("Wiki.js Prometheus metrics", () => {
  it("parses the Wiki.js counts and ignores similarly named series", () => {
    const metrics = Buffer.from(
      [
        "# HELP wiki_pages_total Total pages",
        "wiki_pages_total 50",
        "wiki_users_total 8",
        "wiki_users_active_total 6",
        "wiki_groups_total 3",
      ].join("\n"),
    );

    expect(parseWikiJsMetrics(metrics)).toEqual({ pages: 50, users: 8, groups: 3 });
  });

  it("leaves missing metrics unset", () => {
    expect(parseWikiJsMetrics("wiki_pages_total 50\n")).toEqual({ pages: 50, users: null, groups: null });
  });
});