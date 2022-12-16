import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: nextdnsData, error: nextdnsError } = useWidgetAPI(widget, "analytics/status");

  if (nextdnsError) {
    return <Container error={nextdnsError} />;
  }

  if (!nextdnsData) {
    return (
      <Container service={service}>
        <Block key="status" label="widget.status" value={t("nextdns.wait")} />
      </Container>
    );
  }

  if (!nextdnsData?.data?.length) {
    return (
      <Container service={service}>
        <Block key="status" label="widget.status" value={t("nextdns.no_devices")} />
      </Container>
    );
  }

  return (
    <Container service={service}>
      {nextdnsData.data.map(d => <Block key={d.status} label={d.status} value={t("common.number", { value: d.queries })} />)}
    </Container>
  );
}
