import { describe, expect, it, vi } from "vitest";

const { fs, yaml, config, checkAndCopyConfig } = vi.hoisted(() => ({
  fs: {
    readFileSync: vi.fn(() => "proxmox-yaml"),
  },
  yaml: {
    load: vi.fn(),
  },
  config: {
    CONF_DIR: "/conf",
    substituteEnvironmentVars: vi.fn((s) => s),
  },
  checkAndCopyConfig: vi.fn(),
}));

vi.mock("fs", () => ({
  readFileSync: fs.readFileSync,
}));

vi.mock("js-yaml", () => ({
  default: yaml,
  ...yaml,
}));

vi.mock("utils/config/config", () => ({
  default: checkAndCopyConfig,
  ...config,
}));

import { getProxmoxConfig } from "./proxmox";

describe("utils/config/proxmox", () => {
  it("loads and parses proxmox.yaml", () => {
    yaml.load.mockReturnValueOnce({ pve: { url: "http://pve" } });

    expect(getProxmoxConfig()).toEqual({ pve: { url: "http://pve" } });
    expect(checkAndCopyConfig).toHaveBeenCalledWith("proxmox.yaml");
    expect(fs.readFileSync).toHaveBeenCalledWith("/conf/proxmox.yaml", "utf8");
  });
});
