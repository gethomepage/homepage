import { describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

import handler from "pages/api/revalidate";
import { invalidateDashboardData } from "utils/config/dashboard";

vi.mock("utils/config/dashboard", () => ({ invalidateDashboardData: vi.fn() }));

describe("pages/api/revalidate", () => {
  it("invalidates the dashboard snapshot without regenerating a static page", async () => {
    const req = {};
    const res = createMockRes();
    res.revalidate = vi.fn().mockResolvedValueOnce(undefined);

    await handler(req, res);

    expect(invalidateDashboardData).toHaveBeenCalledOnce();
    expect(res.revalidate).not.toHaveBeenCalled();
    expect(res.body).toEqual({ revalidated: true });
  });
});
