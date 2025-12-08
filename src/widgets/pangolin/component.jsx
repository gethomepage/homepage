import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const MAX_ALLOWED_FIELDS = 4;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  if (!widget.fields) {
    widget.fields = ["sites", "resources", "targets", "traffic"];
  } else if (widget.fields?.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  const { data: sitesData, error: sitesError } = useWidgetAPI(widget, "sites");
  const { data: resourcesData, error: resourcesError } = useWidgetAPI(widget, "resources");

  if (sitesError || resourcesError) {
    return <Container service={service} error={sitesError || resourcesError} />;
  }

  if (!sitesData || !resourcesData) {
    return (
      <Container service={service}>
        <Block label="pangolin.sites" />
        <Block label="pangolin.resources" />
        <Block label="pangolin.targets" />
        <Block label="pangolin.traffic" />
        <Block label="pangolin.in" />
        <Block label="pangolin.out" />
      </Container>
    );
  }

  const sites = sitesData.data?.sites || [];
  const resources = resourcesData.data?.resources || [];

  const sitesTotal = sites.length;
  const sitesOnline = sites.filter((s) => s.online).length;

  const resourcesTotal = resources.length;
  const resourcesHealthy = resources.filter(
    (r) => r.targets?.some((t) => t.healthStatus !== "unhealthy") || !r.targets?.length,
  ).length;

  const targetsTotal = resources.reduce((sum, r) => sum + (r.targets?.length || 0), 0);
  const targetsHealthy = resources.reduce(
    (sum, r) => sum + (r.targets?.filter((t) => t.healthStatus !== "unhealthy").length || 0),
    0,
  );

  const trafficIn = sites.reduce((sum, s) => sum + (s.megabytesIn || 0), 0) * 1_000_000;
  const trafficOut = sites.reduce((sum, s) => sum + (s.megabytesOut || 0), 0) * 1_000_000;
  const trafficTotal = trafficIn + trafficOut;

  return (
    <Container service={service}>
      <Block label="pangolin.sites" value={`${sitesOnline} / ${sitesTotal}`} />
      <Block label="pangolin.resources" value={`${resourcesHealthy} / ${resourcesTotal}`} />
      <Block label="pangolin.targets" value={`${targetsHealthy} / ${targetsTotal}`} />
      <Block label="pangolin.traffic" value={t("common.bytes", { value: trafficTotal })} />
      <Block label="pangolin.in" value={t("common.bytes", { value: trafficIn })} />
      <Block label="pangolin.out" value={t("common.bytes", { value: trafficOut })} />
    </Container>
  );
}
