import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: watchYourLANData, error: watchYourLANError } = useWidgetAPI(widget, "all");

  if (watchYourLANError) {
    return <Container service={service} error={watchYourLANError} />;
  }

  if (!watchYourLANData) {
    return (
      <Container service={service}>
        <Block label="watchyourlan.unknown_hosts" />
        <Block label="watchyourlan.known_hosts" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block
        label="watchyourlan.unknown_hosts"
        value={t("common.number", { value: watchYourLANData.filter((item) => item.Known != 1).length })}
      />
      <Block
        label="watchyourlan.known_hosts"
        value={t("common.number", { value: watchYourLANData.filter((item) => item.Known == 1).length })}
      />
    </Container>
  );
}
