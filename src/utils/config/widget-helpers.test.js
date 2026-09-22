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

vi.mock("utils/config/yaml", () => ({ loadYaml: yaml.load }));

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
      {
        type: "customapi",
        options: { index: 3, url: "http://c", headers: { Authorization: "Bearer t" }, requestBody: { foo: "bar" } },
      },
    ]);

    expect(cleaned[0].options.url).toBe("http://x");
    expect(cleaned[0].options.username).toBeUndefined();

    expect(cleaned[1].options.url).toBeUndefined();
    expect(cleaned[1].options.key).toBeUndefined();
    expect(cleaned[1].options.foo).toBe(1);

    expect(cleaned[2].options.url).toBe("http://z");
    expect(cleaned[2].options.apiKey).toBeUndefined();

    expect(cleaned[3].options.url).toBeUndefined();
    expect(cleaned[3].options.headers).toBeUndefined();
    expect(cleaned[3].options.requestBody).toBeUndefined();
  });

  it("getPrivateWidgetOptions keeps customapi request options server-side", async () => {
    fs.readFile.mockResolvedValueOnce("ignored");
    yaml.load.mockReturnValueOnce([
      {
        customapi: {
          url: "http://custom.api/endpoint",
          method: "POST",
          headers: { "X-API-Token": "token" },
          requestBody: { foo: "bar" },
        },
      },
    ]);

    const options = await getPrivateWidgetOptions("customapi", 0);
    expect(options).toEqual(
      expect.objectContaining({
        index: 0,
        url: "http://custom.api/endpoint",
        method: "POST",
        headers: { "X-API-Token": "token" },
        requestBody: { foo: "bar" },
      }),
    );
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
