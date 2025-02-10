// import NetworkingV1Api from "@kubernetes/client-node";


// export async function listIngress(kc) {

//     const networking = kc.makeApiClient(NetworkingV1Api);

//     const ingressList = await networking
//     .listIngressForAllNamespaces(null, null, null, null)
//     .then((response) => response.body)
//     .catch((error) => {
//         logger.error("Error getting ingresses: %d %s %s", error.statusCode, error.body, error.response);
//         logger.debug(error);
//         return null;
//     });

//     return ingressList;
// }