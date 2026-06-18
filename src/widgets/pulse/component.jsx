import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

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

  const resources = resourcesData.resources ?? [];

  const nodes = resources.filter((r) => r.type === "node");
  const vms = resources.filter((r) => r.type === "vm");
  const lxcs = resources.filter((r) => r.type === "container" && r.platformType === "proxmox-pve");

  const nodesOnline = nodes.filter((n) => n.status === "online").length;
  const vmsRunning = vms.filter((v) => v.status === "running").length;
  const lxcsRunning = lxcs.filter((c) => c.status === "running").length;

  return (
    <Container service={service}>
      <Block label="pulse.nodes" value={`${nodesOnline}/${nodes.length}`} />
      <Block label="pulse.vms" value={`${vmsRunning}/${vms.length}`} />
      <Block label="pulse.lxcs" value={`${lxcsRunning}/${lxcs.length}`} />
    </Container>
  );
}
