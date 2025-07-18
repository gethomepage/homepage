import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";
import useSWR from "swr";

export default function ProxmoxVM({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data, error } = useSWR(`/api/proxmox/stats/${widget.node}/${widget.vmid}?type=${widget.type || "qemu"}`);

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="resources.cpu" />
        <Block label="resources.mem" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="resources.cpu" value={t("common.percent", { value: data.cpu * 100 })} />
      <Block label="resources.mem" value={t("common.bytes", { value: data.mem })} />
    </Container>
  );
}
