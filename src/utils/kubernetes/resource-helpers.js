// import getUrlSchema from "utils/kubernetes/kubernetes-routes";
// import { substituteEnvironmentVars } from "utils/config/config";
// import createLogger from "utils/logger";
// import * as shvl from "utils/config/shvl";

// const logger = createLogger("resource-helpers");

// export function isDiscoverable(resource,instanceName,annotationBase) {
//     return resource.metadata.annotations &&
//         resource.metadata.annotations[`${annotationBase}/enabled`] === "true" &&
//         (!resource.metadata.annotations[`${annotationBase}/instance`] ||
//             resource.metadata.annotations[`${annotationBase}/instance`] === instanceName ||
//             `${annotationBase}/instance.${instanceName}` in resource.metadata.annotations)
// }

// export async function constructedServiceFromResource (resource,annotationBase){
    
//     const ANNOTATION_WIDGET_BASE = `${annotationBase}/widget.`;

//     let constructedService = {
//         app: resource.metadata.annotations[`${annotationBase}/app`] || resource.metadata.name,
//         namespace: resource.metadata.namespace,
//         href: resource.metadata.annotations[`${annotationBase}/href`] || (await getUrlSchema(resource)),
//         name: resource.metadata.annotations[`${annotationBase}/name`] || resource.metadata.name,
//         group: resource.metadata.annotations[`${annotationBase}/group`] || "Kubernetes",
//         weight: resource.metadata.annotations[`${annotationBase}/weight`] || "0",
//         icon: resource.metadata.annotations[`${annotationBase}/icon`] || "",
//         description: resource.metadata.annotations[`${annotationBase}/description`] || "",
//         external: false,
//         type: "service",
//     };
//     if (resource.metadata.annotations[`${annotationBase}/external`]) {
//         constructedService.external =
//         String(resource.metadata.annotations[`${annotationBase}/external`]).toLowerCase() === "true";
//     }
//     if (resource.metadata.annotations[`${annotationBase}/pod-selector`] !== undefined) {
//         constructedService.podSelector = resource.metadata.annotations[`${annotationBase}/pod-selector`];
//     }
//     if (resource.metadata.annotations[`${annotationBase}/ping`]) {
//         constructedService.ping = resource.metadata.annotations[`${annotationBase}/ping`];
//     }
//     if (resource.metadata.annotations[`${annotationBase}/siteMonitor`]) {
//         constructedService.siteMonitor = resource.metadata.annotations[`${annotationBase}/siteMonitor`];
//     }
//     if (resource.metadata.annotations[`${annotationBase}/statusStyle`]) {
//         constructedService.statusStyle = resource.metadata.annotations[`${annotationBase}/statusStyle`];
//     }

//     Object
//         .keys(resource.metadata.annotations)
//         .forEach((annotation) => {
//             if (annotation.startsWith(ANNOTATION_WIDGET_BASE)) {
//                 shvl.set(
//                 constructedService,
//                 annotation.replace(`${annotationBase}/`, ""),
//                 resource.metadata.annotations[annotation],
//                 );
//             }
//         });

//     try {
//         constructedService = JSON.parse(substituteEnvironmentVars(JSON.stringify(constructedService)));
//     } catch (e) {
//         logger.error("Error attempting k8s environment variable substitution.");
//         logger.debug(e);
//     }

//     return constructedService;
// }