import { describe, expect, it } from "vitest";

import { columnMap } from "./columns";

describe("utils/layout/columns", () => {
  it("maps column counts to responsive grid classes", () => {
    expect(columnMap).toHaveLength(9);
    expect(columnMap[1]).toContain("grid-cols-1");
    expect(columnMap[2]).toContain("md:grid-cols-2");
    expect(columnMap[8]).toContain("lg:grid-cols-8");
  });
});
