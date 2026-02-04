import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { bookmarksResponse } = vi.hoisted(() => ({
  bookmarksResponse: vi.fn(),
}));

vi.mock("utils/config/api-response", () => ({
  bookmarksResponse,
}));

import handler from "pages/api/bookmarks";

describe("pages/api/bookmarks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns bookmarksResponse()", async () => {
    bookmarksResponse.mockResolvedValueOnce({ ok: true });

    const req = { query: {} };
    const res = createMockRes();

    await handler(req, res);

    expect(res.body).toEqual({ ok: true });
  });
});
