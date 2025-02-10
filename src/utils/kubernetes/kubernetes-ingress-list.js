import {NetworkingV1Api} from "@kubernetes/client-node";

import createLogger from "utils/logger";

const logger = createLogger("kubernetes-ingress-list");


export default async function listIngress(kubeArguments) {

    const kc = kubeArguments.config;
    const networking = kc.makeApiClient(NetworkingV1Api);
    const { ingress } = kubeArguments;
    let ingressList = []
    
    if (ingress===true){

        const ingressData = await networking
        .listIngressForAllNamespaces(null, null, null, null)
        .then((response) => response.body)
        .catch((error) => {
            logger.error("Error getting ingresses: %d %s %s", error.statusCode, error.body, error.response);
            logger.debug(error);
            return null;
        });
        ingressList = ingressData.items;
    }
    return ingressList;
}