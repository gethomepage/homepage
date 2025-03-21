import listIngress from "utils/kubernetes/ingress-list";
import listTraefikIngress from "utils/kubernetes/traefik-list";
import listHttpRoute from "utils/kubernetes/httproute-list";
import { isDiscoverable, constructedServiceFromResource } from "utils/kubernetes/resource-helpers";

const kubernetes = {
  listIngress,
  listTraefikIngress,
  listHttpRoute,
  isDiscoverable,
  constructedServiceFromResource,
};

export default kubernetes;
