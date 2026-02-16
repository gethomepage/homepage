import { describe, expect, it, vi } from "vitest";

const { getSettings } = vi.hoisted(() => ({
  getSettings: vi.fn(),
}));

vi.mock("utils/config/config", () => ({
  getSettings,
}));

import RobotsTxt, { getServerSideProps } from "pages/robots.txt.js";

function createMockRes() {
  return {
    setHeader: vi.fn(),
    write: vi.fn(),
    end: vi.fn(),
  };
}

describe("pages/robots.txt", () => {
  it("allows indexing when disableIndexing is falsey", async () => {
    getSettings.mockReturnValueOnce({ disableIndexing: false });
    const res = createMockRes();

    await getServerSideProps({ res });

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/plain");
    expect(res.write).toHaveBeenCalledWith("User-agent: *\nAllow: /");
    expect(res.end).toHaveBeenCalled();
  });

  it("disallows indexing when disableIndexing is truthy", async () => {
    getSettings.mockReturnValueOnce({ disableIndexing: true });
    const res = createMockRes();

    await getServerSideProps({ res });

    expect(res.write).toHaveBeenCalledWith("User-agent: *\nDisallow: /");
  });

  it("exports a placeholder component", () => {
    expect(RobotsTxt()).toBeNull();
  });
});
