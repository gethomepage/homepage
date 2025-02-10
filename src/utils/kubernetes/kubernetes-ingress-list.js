import NetworkingV1Api from "@kubernetes/client-node";

import createLogger from "utils/logger";

const logger = createLogger("kubernetes-ingress-list");


export default async function listIngress(kubeArguments) {

    const networking = kubeArguments.config.makeApiClient(NetworkingV1Api);
    const { ingress} = kubeArguments;
    let ingressList = []
    
    if (ingress===true){
        ingressList = await networking
        .listIngressForAllNamespaces(null, null, null, null)
        .then((response) => response.body)
        .catch((error) => {
            logger.error("Error getting ingresses: %d %s %s", error.statusCode, error.body, error.response);
            logger.debug(error);
            return null;
        });
    }
    return ingressList.items;
}