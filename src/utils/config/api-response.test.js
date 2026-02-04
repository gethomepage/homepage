import { beforeEach, describe, expect, it, vi } from "vitest";

const { fs, yaml, config, widgetHelpers, serviceHelpers } = vi.hoisted(() => ({
  fs: {
    readFile: vi.fn(),
  },
  yaml: {
    load: vi.fn(),
  },
  config: {
    CONF_DIR: "/conf",
    getSettings: vi.fn(),
    substituteEnvironmentVars: vi.fn((s) => s),
    default: vi.fn(),
  },
  widgetHelpers: {
    widgetsFromConfig: vi.fn(),
    cleanWidgetGroups: vi.fn(),
  },
  serviceHelpers: {
    servicesFromDocker: vi.fn(),
    servicesFromKubernetes: vi.fn(),
    servicesFromConfig: vi.fn(),
    cleanServiceGroups: vi.fn((g) => g),
    findGroupByName: vi.fn(),
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
vi.mock("utils/config/widget-helpers", () => widgetHelpers);
vi.mock("utils/config/service-helpers", () => serviceHelpers);

import { bookmarksResponse, servicesResponse, widgetsResponse } from "./api-response";

describe("utils/config/api-response", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bookmarksResponse sorts groups based on settings layout", async () => {
    fs.readFile.mockResolvedValueOnce("ignored");
    config.getSettings.mockResolvedValueOnce({ layout: { B: {}, A: {} } });
    yaml.load.mockReturnValueOnce([{ A: [{ LinkA: [{ href: "a" }] }] }, { B: [{ LinkB: [{ href: "b" }] }] }]);

    const res = await bookmarksResponse();
    expect(res.map((g) => g.name)).toEqual(["B", "A"]);
  });

  it("widgetsResponse returns sanitized configured widgets", async () => {
    widgetHelpers.widgetsFromConfig.mockResolvedValueOnce([{ type: "search", options: { url: "x" } }]);
    widgetHelpers.cleanWidgetGroups.mockResolvedValueOnce([{ type: "search", options: { index: 0 } }]);

    expect(await widgetsResponse()).toEqual([{ type: "search", options: { index: 0 } }]);
  });

  it("servicesResponse merges groups and sorts services by weight then name", async () => {
    // Minimal stubs for findGroupByName used within servicesResponse.
    serviceHelpers.findGroupByName.mockImplementation((groups, name) => groups.find((g) => g.name === name) ?? null);

    serviceHelpers.servicesFromDocker.mockResolvedValueOnce([
      {
        name: "GroupA",
        services: [
          { name: "b", weight: 200 },
          { name: "a", weight: 200 },
        ],
        groups: [],
      },
    ]);
    serviceHelpers.servicesFromKubernetes.mockResolvedValueOnce([
      { name: "GroupA", services: [{ name: "c", weight: 100 }], groups: [] },
    ]);
    serviceHelpers.servicesFromConfig.mockResolvedValueOnce([
      { name: "GroupA", services: [{ name: "d", weight: 50 }], groups: [] },
      { name: "Empty", services: [], groups: [] },
    ]);

    config.getSettings.mockResolvedValueOnce({ layout: { GroupA: {}, GroupB: {} } });

    const groups = await servicesResponse();
    expect(groups.map((g) => g.name)).toEqual(["GroupA"]);
    expect(groups[0].services.map((s) => s.name)).toEqual(["d", "c", "a", "b"]);
  });

  it("servicesResponse merges discovered nested groups into their configured parent layout group", async () => {
    serviceHelpers.findGroupByName.mockImplementation(function find(groups, name, parent) {
      for (const group of groups ?? []) {
        if (group.name === name) {
          if (parent) group.parent = parent;
          return group;
        }
        const found = find(group.groups, name, group.name);
        if (found) return found;
      }
      return null;
    });

    serviceHelpers.servicesFromDocker.mockResolvedValueOnce([
      {
        name: "Child",
        services: [
          { name: "svcB", weight: 50 },
          { name: "svcA", weight: 10 },
        ],
        groups: [],
      },
    ]);
    serviceHelpers.servicesFromKubernetes.mockResolvedValueOnce([]);
    serviceHelpers.servicesFromConfig.mockResolvedValueOnce([
      {
        name: "Top",
        services: [],
        groups: [{ name: "Child", services: [], groups: [] }],
      },
    ]);

    config.getSettings.mockResolvedValueOnce({ layout: { Top: { Child: {} } } });

    const groups = await servicesResponse();

    expect(groups.map((g) => g.name)).toEqual(["Top"]);
    expect(groups[0].groups).toHaveLength(1);
    expect(groups[0].groups[0].name).toBe("Child");
    expect(groups[0].groups[0].services.map((s) => s.name)).toEqual(["svcA", "svcB"]);
  });
});
