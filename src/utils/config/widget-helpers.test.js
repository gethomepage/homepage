import { beforeEach, describe, expect, it, vi } from "vitest";

const { fs, yaml, config } = vi.hoisted(() => ({
  fs: {
    readFile: vi.fn(),
  },
  yaml: {
    load: vi.fn(),
  },
  config: {
    CONF_DIR: "/conf",
    substituteEnvironmentVars: vi.fn((s) => s),
    default: vi.fn(),
  },
}));

vi.mock("fs", () => ({
  promises: fs,
}));

vi.mock("js-yaml", () => ({
  default: yaml,
  ...yaml,
}));

vi.mock("utils/config/config", () => config);

import { cleanWidgetGroups, getPrivateWidgetOptions, widgetsFromConfig } from "./widget-helpers";

describe("utils/config/widget-helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("widgetsFromConfig maps YAML into a typed widgets array with indices", async () => {
    fs.readFile.mockResolvedValueOnce("ignored");
    yaml.load.mockReturnValueOnce([{ search: { provider: "google", url: "http://x", key: "k" } }]);

    const widgets = await widgetsFromConfig();
    expect(widgets).toEqual([
      {
        type: "search",
        options: { index: 0, provider: "google", url: "http://x", key: "k" },
      },
    ]);
  });

  it("cleanWidgetGroups removes private options and hides url except for search/glances", async () => {
    const cleaned = await cleanWidgetGroups([
      { type: "search", options: { index: 0, url: "http://x", username: "u", password: "p" } },
      { type: "something", options: { index: 1, url: "http://y", key: "k", foo: 1 } },
      { type: "glances", options: { index: 2, url: "http://z", apiKey: "k", bar: 2 } },
    ]);

    expect(cleaned[0].options.url).toBe("http://x");
    expect(cleaned[0].options.username).toBeUndefined();

    expect(cleaned[1].options.url).toBeUndefined();
    expect(cleaned[1].options.key).toBeUndefined();
    expect(cleaned[1].options.foo).toBe(1);

    expect(cleaned[2].options.url).toBe("http://z");
    expect(cleaned[2].options.apiKey).toBeUndefined();
  });

  it("getPrivateWidgetOptions returns private options for a specific widget", async () => {
    fs.readFile.mockResolvedValueOnce("ignored");
    yaml.load.mockReturnValueOnce([{ search: { url: "http://x", username: "u", password: "p", key: "k" } }]);

    const options = await getPrivateWidgetOptions("search", 0);
    expect(options).toEqual(
      expect.objectContaining({
        index: 0,
        url: "http://x",
        username: "u",
        password: "p",
        key: "k",
      }),
    );

    // And the full list when no args are provided
    fs.readFile.mockResolvedValueOnce("ignored");
    yaml.load.mockReturnValueOnce([{ search: { url: "http://x", username: "u" } }]);
    const all = await getPrivateWidgetOptions();
    expect(Array.isArray(all)).toBe(true);
    expect(all[0].options.url).toBe("http://x");
  });
});
