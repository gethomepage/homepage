import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: netalertxData, error: netalertxError } = useWidgetAPI(widget, "data");

  if (netalertxError) {
    return <Container service={service} error={netalertxError} />;
  }

  if (!netalertxData) {
    return (
      <Container service={service}>
        <Block label="netalertx.total" />
        <Block label="netalertx.connected" />
        <Block label="netalertx.new_devices" />
        <Block label="netalertx.down_alerts" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="netalertx.total" value={t("common.number", { value: parseInt(netalertxData[0], 10) })} />
      <Block label="netalertx.connected" value={t("common.number", { value: parseInt(netalertxData[1], 10) })} />
      <Block label="netalertx.new_devices" value={t("common.number", { value: parseInt(netalertxData[3], 10) })} />
      <Block label="netalertx.down_alerts" value={t("common.number", { value: parseInt(netalertxData[4], 10) })} />
    </Container>
  );
}
