import CustomObjectsApi from "@kubernetes/client-node";

import { checkCRD,ANNOTATION_BASE } from "utils/config/kubernetes";
import createLogger from "utils/logger";

const logger = createLogger("traefik-list");

export default async function listTraefikIngress(kubeArguments) {
    
    const kc = kubeArguments.config;
    const { traefik } = kubeArguments;
    const traefikList = [];

    if (traefik) {
        const crd = kc.makeApiClient(CustomObjectsApi);
        const traefikContainoExists = await checkCRD("ingressroutes.traefik.containo.us",kc,logger);
        const traefikExists = await checkCRD("ingressroutes.traefik.io",kc,logger);

        const traefikIngressListContaino = await crd
        .listClusterCustomObject("traefik.containo.us", "v1alpha1", "ingressroutes")
        .then((response) => response.body)
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
        .listClusterCustomObject("traefik.io", "v1alpha1", "ingressroutes")
        .then((response) => response.body)
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