import getUrlSchema from "utils/kubernetes/kubernetes-routes";
import { substituteEnvironmentVars } from "utils/config/config";
import { ANNOTATION_BASE,ANNOTATION_WIDGET_BASE } from "utils/config/kubernetes";
import createLogger from "utils/logger";
import * as shvl from "utils/config/shvl";

const logger = createLogger("resource-helpers");

export function isDiscoverable(resource,instanceName) {
    return resource.metadata.annotations &&
        resource.metadata.annotations[`${ANNOTATION_BASE}/enabled`] === "true" &&
        (!resource.metadata.annotations[`${ANNOTATION_BASE}/instance`] ||
            resource.metadata.annotations[`${ANNOTATION_BASE}/instance`] === instanceName ||
            `${ANNOTATION_BASE}/instance.${instanceName}` in resource.metadata.annotations)
};

export async function constructedServiceFromResource (resource){
    let constructedService = {
        app: resource.metadata.annotations[`${ANNOTATION_BASE}/app`] || resource.metadata.name,
        namespace: resource.metadata.namespace,
        href: resource.metadata.annotations[`${ANNOTATION_BASE}/href`] || (await getUrlSchema(resource)),
        name: resource.metadata.annotations[`${ANNOTATION_BASE}/name`] || resource.metadata.name,
        group: resource.metadata.annotations[`${ANNOTATION_BASE}/group`] || "Kubernetes",
        weight: resource.metadata.annotations[`${ANNOTATION_BASE}/weight`] || "0",
        icon: resource.metadata.annotations[`${ANNOTATION_BASE}/icon`] || "",
        description: resource.metadata.annotations[`${ANNOTATION_BASE}/description`] || "",
        external: false,
        type: "service",
    };
    if (resource.metadata.annotations[`${ANNOTATION_BASE}/external`]) {
        constructedService.external =
        String(resource.metadata.annotations[`${ANNOTATION_BASE}/external`]).toLowerCase() === "true";
    }
    if (resource.metadata.annotations[`${ANNOTATION_BASE}/pod-selector`] !== undefined) {
        constructedService.podSelector = resource.metadata.annotations[`${ANNOTATION_BASE}/pod-selector`];
    }
    if (resource.metadata.annotations[`${ANNOTATION_BASE}/ping`]) {
        constructedService.ping = resource.metadata.annotations[`${ANNOTATION_BASE}/ping`];
    }
    if (resource.metadata.annotations[`${ANNOTATION_BASE}/siteMonitor`]) {
        constructedService.siteMonitor = resource.metadata.annotations[`${ANNOTATION_BASE}/siteMonitor`];
    }
    if (resource.metadata.annotations[`${ANNOTATION_BASE}/statusStyle`]) {
        constructedService.statusStyle = resource.metadata.annotations[`${ANNOTATION_BASE}/statusStyle`];
    }

    Object
        .keys(resource.metadata.annotations)
        .forEach((annotation) => {
            if (annotation.startsWith(ANNOTATION_WIDGET_BASE)) {
                shvl.set(
                constructedService,
                annotation.replace(`${ANNOTATION_BASE}/`, ""),
                resource.metadata.annotations[annotation],
                );
            }
        });

    try {
        constructedService = JSON.parse(substituteEnvironmentVars(JSON.stringify(constructedService)));
    } catch (e) {
        logger.error("Error attempting k8s environment variable substitution.");
        logger.debug(e);
    }

    return constructedService;
}