import { CustomObjectsApi } from "@kubernetes/client-node";

import { ANNOTATION_BASE, checkCRD, getKubeConfig, getKubernetes } from "utils/config/kubernetes";
import createLogger from "utils/logger";

const logger = createLogger("traefik-list");
const kc = getKubeConfig();

export default async function listTraefikIngress() {
  const { traefik } = getKubernetes();
  const traefikList = [];

  if (traefik) {
    const crd = kc.makeApiClient(CustomObjectsApi);
    const traefikContainoExists = await checkCRD("ingressroutes.traefik.containo.us", kc, logger);
    const traefikExists = await checkCRD("ingressroutes.traefik.io", kc, logger);

    const traefikIngressListContaino = await crd
      .listClusterCustomObject({
        group: "traefik.containo.us",
        version: "v1alpha1",
        plural: "ingressroutes",
      })
      .catch(async (error) => {
        if (traefikContainoExists) {
          logger.error(
            "Error getting traefik ingresses from traefik.containo.us: %d %s %s",
            error.statusCode,
            error.body,
            error.response,
          );
          logger.debug(error);
        }

        return [];
      });

    const traefikIngressListIo = await crd
      .listClusterCustomObject({
        group: "traefik.io",
        version: "v1alpha1",
        plural: "ingressroutes",
      })
      .catch(async (error) => {
        if (traefikExists) {
          logger.error(
            "Error getting traefik ingresses from traefik.io: %d %s %s",
            error.statusCode,
            error.body,
            error.response,
          );
          logger.debug(error);
        }

        return [];
      });

    const traefikIngressList = [...(traefikIngressListContaino?.items ?? []), ...(traefikIngressListIo?.items ?? [])];

    if (traefikIngressList.length > 0) {
      const traefikServices = traefikIngressList.filter(
        (ingress) => ingress.metadata.annotations && ingress.metadata.annotations[`${ANNOTATION_BASE}/href`],
      );
      traefikList.push(...traefikServices);
    }
  }
  return traefikList;
}
