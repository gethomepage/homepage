import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: piholeData, error: piholeError } = useWidgetAPI(widget, "data");

  if (piholeError) {
    return <Container service={service} error={piholeError} />;
  }

  if (!piholeData) {
    return (
      <Container service={service}>
        <Block label="pialert.total" />
        <Block label="pialert.connected" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="pialert.total" value={t("common.number", { value: parseInt(piholeData[0], 10) })} />
      <Block label="pialert.connected" value={t("common.number", { value: parseInt(piholeData[1], 10) })} />
      <Block label="pialert.new_devices" value={t("common.number", { value: parseInt(piholeData[3], 10) })} />
      <Block label="pialert.down_alerts" value={t("common.number", { value: parseInt(piholeData[4], 10) })} />
    </Container>
  );
}
