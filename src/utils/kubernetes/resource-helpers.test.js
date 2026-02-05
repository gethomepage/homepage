import { beforeEach, describe, expect, it, vi } from "vitest";

const { state, substituteEnvironmentVars, getKubeConfig, logger } = vi.hoisted(() => {
  const state = {
    gatewayProtocol: "https",
  };

  const substituteEnvironmentVars = vi.fn((raw) =>
    raw.replaceAll("${DESC}", process.env.DESC ?? "").replaceAll("${ICON}", process.env.ICON ?? ""),
  );

  const crd = {
    getNamespacedCustomObject: vi.fn(async () => ({
      spec: { listeners: [{ name: "web", protocol: state.gatewayProtocol.toUpperCase() }] },
    })),
  };

  const kc = {
    makeApiClient: vi.fn(() => crd),
  };

  return {
    state,
    substituteEnvironmentVars,
    getKubeConfig: vi.fn(() => kc),
    logger: { error: vi.fn(), debug: vi.fn() },
  };
});

vi.mock("@kubernetes/client-node", () => ({
  CustomObjectsApi: class CustomObjectsApi {},
}));

vi.mock("utils/config/config", () => ({
  substituteEnvironmentVars,
}));

vi.mock("utils/config/kubernetes", () => ({
  ANNOTATION_BASE: "gethomepage.dev",
  ANNOTATION_WIDGET_BASE: "gethomepage.dev/widget.",
  HTTPROUTE_API_GROUP: "gateway.networking.k8s.io",
  HTTPROUTE_API_VERSION: "v1",
  getKubeConfig,
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

import { constructedServiceFromResource, isDiscoverable } from "./resource-helpers";

describe("utils/kubernetes/resource-helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DESC = "desc";
    process.env.ICON = "mdi:test";
    state.gatewayProtocol = "https";
  });

  it("checks discoverability by annotations and instance", () => {
    const base = "gethomepage.dev";
    const resource = { metadata: { annotations: { [`${base}/enabled`]: "true" } } };

    expect(isDiscoverable(resource, "x")).toBe(true);
    expect(isDiscoverable({ metadata: { annotations: { [`${base}/enabled`]: "false" } } }, "x")).toBe(false);
    expect(
      isDiscoverable({ metadata: { annotations: { [`${base}/enabled`]: "true", [`${base}/instance`]: "x" } } }, "x"),
    ).toBe(true);
    expect(
      isDiscoverable({ metadata: { annotations: { [`${base}/enabled`]: "true", [`${base}/instance.y`]: "1" } } }, "y"),
    ).toBe(true);
  });

  it("constructs a service from an ingress and applies widget annotations + env substitution", async () => {
    const base = "gethomepage.dev";
    const resource = {
      kind: "Ingress",
      metadata: {
        name: "app",
        namespace: "ns",
        annotations: {
          [`${base}/external`]: "TRUE",
          [`${base}/description`]: "${DESC}",
          [`${base}/icon`]: "${ICON}",
          [`${base}/pod-selector`]: "app=test",
          [`${base}/ping`]: "http://example.com/ping",
          [`${base}/siteMonitor`]: "http://example.com/health",
          [`${base}/statusStyle`]: "dot",
          [`${base}/widget.type`]: "kubernetes",
          [`${base}/widget.url`]: "http://x",
        },
      },
      spec: {
        tls: [{}],
        rules: [{ host: "example.com", http: { paths: [{ path: "/app" }] } }],
      },
    };

    const service = await constructedServiceFromResource(resource);

    expect(service.href).toBe("https://example.com/app");
    expect(service.external).toBe(true);
    expect(service.description).toBe("desc");
    expect(service.icon).toBe("mdi:test");
    expect(service.podSelector).toBe("app=test");
    expect(service.ping).toBe("http://example.com/ping");
    expect(service.siteMonitor).toBe("http://example.com/health");
    expect(service.statusStyle).toBe("dot");
    expect(service.widget.type).toBe("kubernetes");
    expect(service.widget.url).toBe("http://x");
    expect(substituteEnvironmentVars).toHaveBeenCalled();
  });

  it("constructs a href from an HTTPRoute using the gateway listener protocol", async () => {
    const base = "gethomepage.dev";
    const resource = {
      kind: "HTTPRoute",
      metadata: {
        name: "route",
        namespace: "ns",
        annotations: {
          [`${base}/enabled`]: "true",
        },
      },
      spec: {
        hostnames: ["example.com"],
        parentRefs: [{ namespace: "ns", name: "gw", sectionName: "web" }],
        rules: [
          {
            matches: [{ path: { type: "PathPrefix", value: "/r" } }],
          },
        ],
      },
    };

    const service = await constructedServiceFromResource(resource);
    expect(service.href).toBe("https://example.com/r");
  });

  it("falls back to http when the gateway listener protocol cannot be resolved", async () => {
    const kc = getKubeConfig();
    const crd = kc.makeApiClient();
    crd.getNamespacedCustomObject.mockRejectedValueOnce({
      statusCode: 500,
      body: "boom",
      response: "resp",
    });

    const base = "gethomepage.dev";
    const resource = {
      kind: "HTTPRoute",
      metadata: {
        name: "route",
        namespace: "ns",
        annotations: {
          [`${base}/enabled`]: "true",
        },
      },
      spec: {
        hostnames: ["example.com"],
        parentRefs: [{ namespace: "ns", name: "gw", sectionName: "web" }],
        rules: [
          {
            matches: [{ path: { type: "PathPrefix", value: "/r" } }],
          },
        ],
      },
    };

    const service = await constructedServiceFromResource(resource);
    expect(service.href).toBe("http://example.com/r");
    expect(logger.error).toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalled();
  });

  it("logs and recovers when environment substitution yields invalid json", async () => {
    substituteEnvironmentVars.mockImplementationOnce(() => "{bad json");

    const base = "gethomepage.dev";
    const resource = {
      kind: "Ingress",
      metadata: {
        name: "app",
        namespace: "ns",
        annotations: {
          [`${base}/enabled`]: "true",
        },
      },
      spec: {
        rules: [{ host: "example.com", http: { paths: [{ path: "/app" }] } }],
      },
    };

    const service = await constructedServiceFromResource(resource);
    expect(service.name).toBe("app");
    expect(logger.error).toHaveBeenCalledWith("Error attempting k8s environment variable substitution.");
    expect(logger.debug).toHaveBeenCalled();
  });
});
