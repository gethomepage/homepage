import { beforeEach, describe, expect, it, vi } from "vitest";

const { fs, yaml, config, checkAndCopyConfig, kube, apiExt } = vi.hoisted(() => {
  const apiExt = {
    readCustomResourceDefinitionStatus: vi.fn(),
  };

  const kube = {
    loadFromCluster: vi.fn(),
    loadFromDefault: vi.fn(),
    makeApiClient: vi.fn(() => apiExt),
  };

  return {
    fs: {
      readFileSync: vi.fn(() => "kube-yaml"),
    },
    yaml: {
      load: vi.fn(),
    },
    config: {
      CONF_DIR: "/conf",
      substituteEnvironmentVars: vi.fn((s) => s),
    },
    checkAndCopyConfig: vi.fn(),
    kube,
    apiExt,
  };
});

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

vi.mock("@kubernetes/client-node", () => ({
  ApiextensionsV1Api: class ApiextensionsV1Api {},
  KubeConfig: class KubeConfig {
    loadFromCluster() {
      return kube.loadFromCluster();
    }
    loadFromDefault() {
      return kube.loadFromDefault();
    }
    makeApiClient() {
      return kube.makeApiClient();
    }
  },
}));

import { checkCRD, getKubeConfig, getKubernetes } from "./kubernetes";

describe("utils/config/kubernetes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getKubernetes loads and parses kubernetes.yaml", () => {
    yaml.load.mockReturnValueOnce({ mode: "disabled" });

    expect(getKubernetes()).toEqual({ mode: "disabled" });
    expect(checkAndCopyConfig).toHaveBeenCalledWith("kubernetes.yaml");
  });

  it("getKubeConfig returns null when disabled", () => {
    yaml.load.mockReturnValueOnce({ mode: "disabled" });
    expect(getKubeConfig()).toBeNull();
  });

  it("getKubeConfig loads from cluster/default based on mode", () => {
    yaml.load.mockReturnValueOnce({ mode: "cluster" });
    const kc1 = getKubeConfig();
    expect(kube.loadFromCluster).toHaveBeenCalled();
    expect(kc1).not.toBeNull();

    yaml.load.mockReturnValueOnce({ mode: "default" });
    const kc2 = getKubeConfig();
    expect(kube.loadFromDefault).toHaveBeenCalled();
    expect(kc2).not.toBeNull();
  });

  it("checkCRD returns true when the CRD exists", async () => {
    apiExt.readCustomResourceDefinitionStatus.mockResolvedValueOnce({ ok: true });
    const logger = { error: vi.fn() };

    await expect(checkCRD("x.example", kube, logger)).resolves.toBe(true);
  });

  it("checkCRD returns false and logs on 403", async () => {
    apiExt.readCustomResourceDefinitionStatus.mockRejectedValueOnce({
      statusCode: 403,
      body: { message: "nope" },
    });
    const logger = { error: vi.fn() };

    await expect(checkCRD("x.example", kube, logger)).resolves.toBe(false);
    expect(logger.error).toHaveBeenCalled();
  });
});
