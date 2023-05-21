import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: pialertData, error: pialertError } = useWidgetAPI(widget, "data");

  if (pialertError) {
    return <Container service={service} error={pialertError} />;
  }

  if (!pialertData) {
    return (
      <Container service={service}>
        <Block label="pialert.total" />
        <Block label="pialert.connected" />
        <Block label="pialert.new_devices" />
        <Block label="pialert.down_alerts" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="pialert.total" value={t("common.number", { value: parseInt(pialertData[0], 10) })} />
      <Block label="pialert.connected" value={t("common.number", { value: parseInt(pialertData[1], 10) })} />
      <Block label="pialert.new_devices" value={t("common.number", { value: parseInt(pialertData[3], 10) })} />
      <Block label="pialert.down_alerts" value={t("common.number", { value: parseInt(pialertData[4], 10) })} />
    </Container>
  );
}
