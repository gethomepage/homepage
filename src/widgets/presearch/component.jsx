import { useTranslation } from "next-i18next";
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  let { data: resp, error } = useWidgetAPI(widget, "status", {
    refreshInterval: 900000,
  });

  if (error) {
    return <Container service={service} error={error} />;
  }

  console.log(resp);
  if (!resp) {
    return (
      <Container service={service}>
        <Block label="presearch.gateway_pool" />
        <Block label="presearch.status" />
        <Block label="presearch.total_requests" />
        <Block label="presearch.avg_reliability_score" />
      </Container>
    );
  }

  const nodeKey = Object.keys(resp.nodes)[0];
  const meta = resp.nodes[nodeKey].meta;
  const status = resp.nodes[nodeKey].status;
  const stats = resp.nodes[nodeKey].period;

  return (
    <Container service={service}>
      <Block label="presearch.gateway_pool" value={meta.gateway_pool} />
      <Block label="presearch.status" value={status.connected ? "UP" : "DOWN"} />
      <Block label="presearch.total_requests" value={stats.total_requests} />
      <Block label="presearch.avg_reliability_score" value={stats.avg_reliability_score} />
    </Container>
  );
}
