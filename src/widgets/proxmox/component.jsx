import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

function calcRunning(total, current) {
  return current.status === "running" ? total + 1 : total;
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: clusterData, error: clusterError } = useWidgetAPI(widget, "cluster/resources");

  if (clusterError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!clusterData || !clusterData.data) {
    return (
      <Container service={service}>
        <Block label="proxmox.vms" />
        <Block label="proxmox.lxc" />
        <Block label="proxmox.cpu" />
        <Block label="proxmox.ram" />
      </Container>
    );
  }

  const { data } = clusterData ;
  const vms = data.filter(item => item.type === "qemu") || [];
  const lxc = data.filter(item => item.type === "lxc") || [];
  const nodes = data.filter(item => item.type === "node") || [];

  const runningVMs = vms.reduce(calcRunning, 0);
  const runningLXC = lxc.reduce(calcRunning, 0);

  // TODO: support more than one node
  // TODO: better handling of cluster with zero nodes
  const node = nodes.length > 0 ? nodes[0] : { cpu: 0.0, mem: 0, maxmem: 0 };

  return (
    <Container service={service}>
      <Block label="proxmox.vms" value={`${runningVMs} / ${vms.length}`} />
      <Block label="proxmox.lxc" value={`${runningLXC} / ${lxc.length}`} />
      <Block label="proxmox.cpu" value={t("common.percent", { value: (node.cpu * 100) })} />
      <Block label="proxmox.mem" value={t("common.percent", { value: ((node.mem / node.maxmem) * 100) })} />
    </Container>
  );
}
