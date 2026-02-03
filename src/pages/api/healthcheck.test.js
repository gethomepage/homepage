import { describe, expect, it } from "vitest";

import createMockRes from "test-utils/create-mock-res";

import handler from "./healthcheck";

describe("pages/api/healthcheck", () => {
  it("returns 'up'", () => {
    const req = {};
    const res = createMockRes();

    handler(req, res);

    expect(res.body).toBe("up");
  });
});
