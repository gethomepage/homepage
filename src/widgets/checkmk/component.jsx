import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: servicesData, error: servicesError } = useWidgetAPI(widget, "services_info", {
    columns: "state",
    query: '{"op": "!=", "left": "state", "right": "0"}',
  });
  const { data: hostsData, error: hostsError } = useWidgetAPI(widget, "hosts_info", {
    columns: "state",
    query: '{"op": "!=", "left": "state", "right": "0"}',
  });

  if (servicesError) {
    return <Container service={service} error={servicesError} />;
  }
  if (hostsError) {
    return <Container service={service} error={hostsError} />;
  }

  if (!servicesData || !hostsData) {
    return (
      <Container service={service}>
        <Block label="checkmk.connectionError" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="checkmk.serviceErrors" value={t("common.number", { value: servicesData.value.length })} />
      <Block label="checkmk.hostErrors" value={t("common.number", { value: hostsData.value.length })} />
    </Container>
  );
}
