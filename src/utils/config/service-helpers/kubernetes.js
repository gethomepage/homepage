import kubernetes from "../../kubernetes/export";
import createLogger from "../../logger";
import checkAndCopyConfig, { getSettings } from "../config";
import { getKubeConfig } from "../kubernetes";

const logger = createLogger("service-helpers");

export async function servicesFromKubernetes() {
  const { instanceName } = getSettings();

  checkAndCopyConfig("kubernetes.yaml");

  try {
    const kc = getKubeConfig();
    if (!kc) {
      return [];
    }

    // resource lists
    const [ingressList, traefikIngressList, httpRouteList] = await Promise.all([
      kubernetes.listIngress(),
      kubernetes.listTraefikIngress(),
      kubernetes.listHttpRoute(),
    ]);

    const resources = [...ingressList, ...traefikIngressList, ...httpRouteList];

    if (!resources) {
      return [];
    }
    const services = await Promise.all(
      resources
        .filter((resource) => kubernetes.isDiscoverable(resource, instanceName))
        .map(async (resource) => kubernetes.constructedServiceFromResource(resource)),
    );

    // map service groups
    return services.reduce((groups, serverService) => {
      let serverGroup = groups.find((group) => group.name === serverService.group);

      if (!serverGroup) {
        serverGroup = {
          name: serverService.group,
          services: [],
        };
        groups.push(serverGroup);
      }

      const { name: serviceName, group: _, ...pushedService } = serverService;

      serverGroup.services.push({
        name: serviceName,
        ...pushedService,
      });

      return groups;
    }, []);
  } catch (e) {
    if (e) logger.error(e);
    throw e;
  }
}
