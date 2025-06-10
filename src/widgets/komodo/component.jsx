import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { data, error } = useWidgetAPI(widget, "stacks", {
    columns: "state",
    query: '{"op": "!=", "left": "state", "right": "0"}',
  });

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="komodo.total" />
        <Block label="komodo.running" />
        <Block label="komodo.down" />
        <Block label="komodo.unhealthy" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="komodo.total" value={t("common.number", { value: data.total })} />
      <Block label="komodo.stopped" value={t("common.number", { value: data.stopped })} />
      <Block label="komodo.running" value={t("common.number", { value: data.running })} />
      <Block label="komodo.down" value={t("common.number", { value: data.down })} />
      <Block label="komodo.unhealthy" value={t("common.number", { value: data.unhealthy })} />
      <Block label="komodo.unknown" value={t("common.number", { value: data.unknown })} />
    </Container>
  );
}
