import { beforeEach, describe, expect, it, vi } from "vitest";

const { fs, yaml } = vi.hoisted(() => ({
  fs: {
    copyFileSync: vi.fn(),
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    readFileSync: vi.fn(),
  },
  yaml: {
    load: vi.fn(),
  },
}));

vi.mock("fs", () => fs);
vi.mock("js-yaml", () => ({ default: yaml, ...yaml }));

describe("utils/config/config checkAndCopyConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env = { ...originalEnv, HOMEPAGE_CONFIG_DIR: "/conf" };
  });

  it("returns false when it cannot create the config directory", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    fs.existsSync.mockReturnValueOnce(false);
    fs.mkdirSync.mockImplementationOnce(() => {
      throw new Error("no perms");
    });

    const mod = await import("./config");
    expect(mod.default("services.yaml")).toBe(false);
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it("copies the skeleton file when the config file does not exist", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    // dir exists
    fs.existsSync.mockReturnValueOnce(true);
    // config file missing
    fs.existsSync.mockReturnValueOnce(false);

    const mod = await import("./config");
    expect(mod.default("services.yaml")).toBe(true);
    expect(fs.copyFileSync).toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalled();

    infoSpy.mockRestore();
  });

  it("exits the process when copying the skeleton fails", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("exit");
    });
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    fs.existsSync.mockReturnValueOnce(true);
    fs.existsSync.mockReturnValueOnce(false);
    fs.copyFileSync.mockImplementationOnce(() => {
      throw new Error("copy failed");
    });

    const mod = await import("./config");
    expect(() => mod.default("services.yaml")).toThrow("exit");
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errSpy).toHaveBeenCalled();

    exitSpy.mockRestore();
    errSpy.mockRestore();
  });

  it("returns a parse error with config name when YAML is invalid", async () => {
    fs.existsSync.mockReturnValueOnce(true);
    fs.existsSync.mockReturnValueOnce(true);
    fs.readFileSync.mockReturnValueOnce("bad");
    yaml.load.mockImplementationOnce(() => {
      throw Object.assign(new Error("yaml bad"), { name: "YAMLException" });
    });

    const mod = await import("./config");
    const result = mod.default("services.yaml");

    expect(result).toEqual(expect.objectContaining({ name: "YAMLException", config: "services.yaml" }));
  });
});
