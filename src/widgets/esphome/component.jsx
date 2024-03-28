import { useTranslation } from "next-i18next";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: resultData, error: resultError } = useWidgetAPI(widget);

  if (resultError) {
    return <Container service={service} error={resultError} />;
  }

  if (!resultData) {
    return (
      <Container service={service}>
        <Block label="esphome.online" />
        <Block label="esphome.offline" />
        <Block label="esphome.offline_alt" />
        <Block label="esphome.unknown" />
        <Block label="esphome.total" />
      </Container>
    );
  }

  const total = Object.keys(resultData).length;
  const online = Object.entries(resultData).filter(([, v]) => v === true).length;
  const notOnline = Object.entries(resultData).filter(([, v]) => v !== true).length;
  const offline = Object.entries(resultData).filter(([, v]) => v === false).length;
  const unknown = Object.entries(resultData).filter(([, v]) => v === null).length;

  return (
    <Container service={service}>
      <Block label="esphome.online" value={t("common.number", { value: online })} />
      <Block label="esphome.offline" value={t("common.number", { value: offline })} />
      <Block label="esphome.offline_alt" value={t("common.number", { value: notOnline })} />
      <Block label="esphome.unknown" value={t("common.number", { value: unknown })} />
      <Block label="esphome.total" value={t("common.number", { value: total })} />
    </Container>
  );
}
