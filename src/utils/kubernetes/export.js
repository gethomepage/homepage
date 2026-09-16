import listHttpRoute from "utils/kubernetes/httproute-list";
import listIngress from "utils/kubernetes/ingress-list";
import { constructedServiceFromResource, isDiscoverable } from "utils/kubernetes/resource-helpers";
import listService from "utils/kubernetes/service-list";
import listTraefikIngress from "utils/kubernetes/traefik-list";

const kubernetes = {
  listIngress,
  listTraefikIngress,
  listHttpRoute,
  listService,
  isDiscoverable,
  constructedServiceFromResource,
};

export default kubernetes;
