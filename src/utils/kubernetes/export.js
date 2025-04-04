import listHttpRoute from "utils/kubernetes/httproute-list";
import listIngress from "utils/kubernetes/ingress-list";
import { constructedServiceFromResource, isDiscoverable } from "utils/kubernetes/resource-helpers";
import listTraefikIngress from "utils/kubernetes/traefik-list";

const kubernetes = {
  listIngress,
  listTraefikIngress,
  listHttpRoute,
  isDiscoverable,
  constructedServiceFromResource,
};

export default kubernetes;
