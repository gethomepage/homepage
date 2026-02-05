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

  it("bookmarksResponse returns [] when bookmarks are missing", async () => {
    fs.readFile.mockResolvedValueOnce("ignored");
    yaml.load.mockReturnValueOnce(null);

    const res = await bookmarksResponse();
    expect(res).toEqual([]);
    expect(config.getSettings).not.toHaveBeenCalled();
  });

  it("bookmarksResponse falls back when settings cannot be loaded", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    fs.readFile.mockResolvedValueOnce("ignored");
    config.getSettings.mockRejectedValueOnce(new Error("bad settings"));
    yaml.load.mockReturnValueOnce([{ A: [{ LinkA: [{ href: "a" }] }] }, { B: [{ LinkB: [{ href: "b" }] }] }]);

    const res = await bookmarksResponse();
    expect(res.map((g) => g.name)).toEqual(["A", "B"]);
    expect(errSpy).toHaveBeenCalled();

    errSpy.mockRestore();
  });

  it("bookmarksResponse sorts groups based on settings layout", async () => {
    fs.readFile.mockResolvedValueOnce("ignored");
    config.getSettings.mockResolvedValueOnce({ layout: { B: {}, A: {} } });
    yaml.load.mockReturnValueOnce([{ A: [{ LinkA: [{ href: "a" }] }] }, { B: [{ LinkB: [{ href: "b" }] }] }]);

    const res = await bookmarksResponse();
    expect(res.map((g) => g.name)).toEqual(["B", "A"]);
  });

  it("bookmarksResponse appends groups not present in the layout", async () => {
    fs.readFile.mockResolvedValueOnce("ignored");
    config.getSettings.mockResolvedValueOnce({ layout: { A: {} } });
    yaml.load.mockReturnValueOnce([{ A: [{ LinkA: [{ href: "a" }] }] }, { C: [{ LinkC: [{ href: "c" }] }] }]);

    const res = await bookmarksResponse();
    expect(res.map((g) => g.name)).toEqual(["A", "C"]);
  });

  it("widgetsResponse returns sanitized configured widgets", async () => {
    widgetHelpers.widgetsFromConfig.mockResolvedValueOnce([{ type: "search", options: { url: "x" } }]);
    widgetHelpers.cleanWidgetGroups.mockResolvedValueOnce([{ type: "search", options: { index: 0 } }]);

    expect(await widgetsResponse()).toEqual([{ type: "search", options: { index: 0 } }]);
  });

  it("widgetsResponse returns [] when widgets cannot be loaded", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    widgetHelpers.widgetsFromConfig.mockRejectedValueOnce(new Error("bad widgets"));

    expect(await widgetsResponse()).toEqual([]);
    expect(errSpy).toHaveBeenCalled();

    errSpy.mockRestore();
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

  it("servicesResponse logs when no docker services are discovered", async () => {
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    serviceHelpers.findGroupByName.mockImplementation((groups, name) => groups.find((g) => g.name === name) ?? null);

    serviceHelpers.servicesFromDocker.mockResolvedValueOnce([]);
    serviceHelpers.servicesFromKubernetes.mockResolvedValueOnce([]);
    serviceHelpers.servicesFromConfig.mockResolvedValueOnce([]);
    config.getSettings.mockResolvedValueOnce({});

    const groups = await servicesResponse();

    expect(groups).toEqual([]);
    expect(debugSpy).toHaveBeenCalledWith("No containers were found with homepage labels.");

    debugSpy.mockRestore();
  });

  it("servicesResponse tolerates discovery/load failures and returns [] when nothing can be loaded", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    serviceHelpers.servicesFromDocker.mockRejectedValueOnce(new Error("docker bad"));
    serviceHelpers.servicesFromKubernetes.mockRejectedValueOnce(new Error("kube bad"));
    serviceHelpers.servicesFromConfig.mockRejectedValueOnce(new Error("config bad"));
    config.getSettings.mockRejectedValueOnce(new Error("settings bad"));

    const groups = await servicesResponse();
    expect(groups).toEqual([]);
    expect(errSpy).toHaveBeenCalled();

    errSpy.mockRestore();
  });

  it("servicesResponse supports multi-level nested layout groups and ensures the top-level parent exists", async () => {
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
      { name: "Child", services: [{ name: "svc", weight: 1 }], groups: [] },
    ]);
    serviceHelpers.servicesFromKubernetes.mockResolvedValueOnce([]);
    serviceHelpers.servicesFromConfig.mockResolvedValueOnce([{ name: "Root", services: [], groups: [] }]);

    config.getSettings.mockResolvedValueOnce({ layout: { Root: { Top: { Child: {} } } } });

    const groups = await servicesResponse();

    expect(groups.map((g) => g.name)).toEqual(["Root"]);
    expect(groups[0].groups[0].name).toBe("Top");
    expect(groups[0].groups[0].groups[0].name).toBe("Child");
    expect(groups[0].groups[0].groups[0].services).toEqual([{ name: "svc", weight: 1 }]);
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

  it("servicesResponse merges nested discovered groups into their configured parent when no layout is defined", async () => {
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
      { name: "Child", services: [{ name: "svc", weight: 1 }], groups: [] },
    ]);
    serviceHelpers.servicesFromKubernetes.mockResolvedValueOnce([]);
    serviceHelpers.servicesFromConfig.mockResolvedValueOnce([
      { name: "Top", services: [], groups: [{ name: "Child", services: [], groups: [] }] },
    ]);
    config.getSettings.mockResolvedValueOnce({});

    const groups = await servicesResponse();

    expect(groups.map((g) => g.name)).toEqual(["Top"]);
    expect(groups[0].groups[0].name).toBe("Child");
    expect(groups[0].groups[0].services).toEqual([{ name: "svc", weight: 1 }]);
  });
});
