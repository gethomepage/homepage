import { useTranslation } from 'next-i18next'

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

function calcRunningService(total, current) {
  return current.Services.length + total;
}

function calcReadyNode(total, current) {
  return current.Status === "ready" ? total + 1 : total;
}

function calcRunningJob(total, current) {
  return current.Status === "running" ? total + 1 : total;
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: nodeData, error: nodeError } = useWidgetAPI(widget, "nodes");
  const { data: jobData, error: jobError } = useWidgetAPI(widget, "jobs");
  const { data: serviceData, error: serviceError } = useWidgetAPI(widget, "services");
  const { data: volumeData, error: volumeError } = useWidgetAPI(widget, "volumes");
  const { data: csiVolumeData, error: csiVolumeError } = useWidgetAPI(widget, "csi_volumes");

  if (nodeError || jobError || serviceError || volumeError || csiVolumeError) {
    const finalError = nodeError ?? jobError ?? serviceError ?? volumeError ?? csiVolumeError;
    return <Container error={finalError} />;
  }

  if (!nodeData || !jobData || !serviceData || !volumeData || !csiVolumeData) {
    return (
      <Container service={service}>
        <Block label="nomad.nodes" />
        <Block label="nomad.jobs" />
        <Block label="nomad.volumes" />
        <Block label="nomad.services" />
      </Container>
    );
  }

  const nodes = nodeData || [];
  const readyNodes = nodes.reduce(calcReadyNode, 0);

  const jobs = jobData || [];
  const runningJobs = jobs.reduce(calcRunningJob, 0);

  const volumeTotal = volumeData.length + csiVolumeData.length;
  const runningServices = (serviceData || []).reduce(calcRunningService, 0);

  return (
    <Container service={service}>
      <Block label="nomad.nodes" value={`${readyNodes} / ${nodes.length}`} />
      <Block label="nomad.jobs" value={`${runningJobs} / ${jobs.length}`} />
      <Block label="nomad.volumes" value={t("common.number", { value: volumeTotal })} />
      <Block label="nomad.services" value={t("common.number", { value: runningServices })} />
    </Container>
  );
}
