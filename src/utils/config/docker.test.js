import { describe, expect, it, vi } from "vitest";

const { fs, yaml, config, checkAndCopyConfig } = vi.hoisted(() => ({
  fs: {
    readFileSync: vi.fn((filePath, encoding) => {
      if (String(filePath).endsWith("/docker.yaml") && encoding === "utf8") return "docker-yaml";
      return Buffer.from(String(filePath));
    }),
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

import getDockerArguments, { getDefaultDockerArgs } from "./docker";

describe("utils/config/docker", () => {
  it("getDefaultDockerArgs returns a socketPath on linux and host on darwin", () => {
    expect(getDefaultDockerArgs("linux")).toEqual({ socketPath: "/var/run/docker.sock" });
    expect(getDefaultDockerArgs("darwin")).toEqual({ host: "127.0.0.1" });
  });

  it("returns default args when no server is given", () => {
    yaml.load.mockReturnValueOnce({});

    const args = getDockerArguments();

    expect(checkAndCopyConfig).toHaveBeenCalledWith("docker.yaml");
    // if running on linux, should return socketPath
    if (process.platform !== "win32" && process.platform !== "darwin") {
      expect(args).toEqual({ socketPath: "/var/run/docker.sock" });
    } else {
      // otherwise, should return host
      expect(args).toEqual(expect.objectContaining({ host: expect.any(String) }));
    }
  });

  it("returns socket config when server has a socket", () => {
    yaml.load.mockReturnValueOnce({
      "docker-local": { socket: "/tmp/docker.sock", swarm: true },
    });

    const args = getDockerArguments("docker-local");

    expect(args).toEqual({ conn: { socketPath: "/tmp/docker.sock" }, swarm: true });
  });

  it("returns host/port/tls/protocol/headers config when provided", () => {
    yaml.load.mockReturnValueOnce({
      remote: {
        host: "10.0.0.1",
        port: 2376,
        swarm: false,
        protocol: "http",
        headers: { "X-Test": "1" },
        tls: { caFile: "ca.pem", certFile: "cert.pem", keyFile: "key.pem" },
      },
    });

    const args = getDockerArguments("remote");

    expect(args).toEqual(
      expect.objectContaining({
        swarm: false,
        conn: expect.objectContaining({
          host: "10.0.0.1",
          port: 2376,
          protocol: "http",
          headers: { "X-Test": "1" },
          ca: expect.any(Buffer),
          cert: expect.any(Buffer),
          key: expect.any(Buffer),
        }),
      }),
    );
  });

  it("returns null when server is not configured", () => {
    yaml.load.mockReturnValueOnce({ other: { host: "x" } });
    expect(getDockerArguments("missing")).toBeNull();
  });

  it("returns the raw server config when it has no host/socket overrides", () => {
    yaml.load.mockReturnValueOnce({
      raw: { swarm: true, something: "else" },
    });

    expect(getDockerArguments("raw")).toEqual({ swarm: true, something: "else" });
  });
});
