import { describe, expect, it, vi } from "vitest";

const { listIngress, listTraefikIngress, listHttpRoute, isDiscoverable, constructedServiceFromResource } = vi.hoisted(
  () => ({
    listIngress: vi.fn(),
    listTraefikIngress: vi.fn(),
    listHttpRoute: vi.fn(),
    isDiscoverable: vi.fn(),
    constructedServiceFromResource: vi.fn(),
  }),
);

vi.mock("utils/kubernetes/ingress-list", () => ({ default: listIngress }));
vi.mock("utils/kubernetes/traefik-list", () => ({ default: listTraefikIngress }));
vi.mock("utils/kubernetes/httproute-list", () => ({ default: listHttpRoute }));
vi.mock("utils/kubernetes/resource-helpers", () => ({ isDiscoverable, constructedServiceFromResource }));

import kubernetes from "./export";

describe("utils/kubernetes/export", () => {
  it("re-exports kubernetes helper functions", () => {
    expect(kubernetes.listIngress).toBe(listIngress);
    expect(kubernetes.listTraefikIngress).toBe(listTraefikIngress);
    expect(kubernetes.listHttpRoute).toBe(listHttpRoute);
    expect(kubernetes.isDiscoverable).toBe(isDiscoverable);
    expect(kubernetes.constructedServiceFromResource).toBe(constructedServiceFromResource);
  });
});
