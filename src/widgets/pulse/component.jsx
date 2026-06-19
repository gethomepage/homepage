import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

const ACTIVE_STATUSES = ["online", "running"];

function countResources(data, resources, type) {
  const statsCount = data?.stats?.byType?.[type];
  if (typeof statsCount === "number") {
    return statsCount;
  }

  if (resources) {
    return resources.filter((resource) => resource.type === type).length;
  }

  return undefined;
}

function countActiveResources(resources, type) {
  return resources
    ? resources.filter((resource) => resource.type === type && ACTIVE_STATUSES.includes(resource.status)).length
    : undefined;
}

function formatResourceCount(total, active) {
  if (total === undefined) {
    return undefined;
  }

  if (active === undefined) {
    return total;
  }

  return `${active} / ${total}`;
}

export default function Component({ service }) {
  const { widget } = service;

  const { data: resourcesData, error: resourcesError } = useWidgetAPI(widget, "resources");

  if (resourcesError) {
    return <Container service={service} error={resourcesError} />;
  }

  if (!resourcesData) {
    return (
      <Container service={service}>
        <Block label="pulse.nodes" />
        <Block label="pulse.vms" />
        <Block label="pulse.lxcs" />
      </Container>
    );
  }

  let resources = resourcesData.resources;
  if (!resources && resourcesData.count === 0) {
    resources = [];
  }
  const nodes = countResources(resourcesData, resources, "node");
  const vms = countResources(resourcesData, resources, "vm");
  const lxcs = countResources(resourcesData, resources, "container");

  return (
    <Container service={service}>
      <Block label="pulse.nodes" value={formatResourceCount(nodes, countActiveResources(resources, "node"))} />
      <Block label="pulse.vms" value={formatResourceCount(vms, countActiveResources(resources, "vm"))} />
      <Block label="pulse.lxcs" value={formatResourceCount(lxcs, countActiveResources(resources, "container"))} />
    </Container>
  );
}
