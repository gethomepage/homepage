import { describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

import handler from "pages/api/revalidate";

describe("pages/api/revalidate", () => {
  it("revalidates and returns {revalidated:true}", async () => {
    const req = {};
    const res = createMockRes();
    res.revalidate = vi.fn().mockResolvedValueOnce(undefined);

    await handler(req, res);

    expect(res.revalidate).toHaveBeenCalledWith("/");
    expect(res.body).toEqual({ revalidated: true });
  });

  it("returns 500 when revalidate throws", async () => {
    const req = {};
    const res = createMockRes();
    res.revalidate = vi.fn().mockRejectedValueOnce(new Error("nope"));

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body).toBe("Error revalidating");
  });
});
