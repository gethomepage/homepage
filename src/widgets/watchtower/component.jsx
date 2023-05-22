import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";


export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: watchData, error: watchError } = useWidgetAPI(widget, "watchtower");

  if (watchError) {
    return <Container service={service} error={watchError} />;
  }

  if (!watchData) {
    return (
      <Container service={service}>
        <Block label="watchtower.containers_scanned " />
        <Block label="watchtower.containers_updated" />
        <Block label="watchtower.containers_failed" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="watchtower.containers_scanned" value={t("common.number", { value: watchData.watchtower_containers_scanned })} />
      <Block label="watchtower.containers_updated" value={t("common.number", { value: watchData.watchtower_containers_updated })} />
      <Block label="watchtower.containers_failed" value={t("common.number", { value: watchData.watchtower_containers_failed })} />
    </Container>
  );
}
