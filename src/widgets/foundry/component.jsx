import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: statusData, error: statusError } = useWidgetAPI(widget, "status");

  if (statusError) {
    return <Container service={service} error={statusError} />;
  }

  if (!statusData) {
    return (
      <Container service={service}>
        <Block label="foundry.version" />
        <Block label="foundry.world" />
        <Block label="foundry.users" />
        <Block label="foundry.uptime" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="foundry.version" value={statusData.version} />
      <Block label="foundry.world" value={statusData.world} />
      <Block label="foundry.users" value={t("common.number", { value: statusData.users })} />
      <Block label="foundry.uptime" value={t("common.uptime", { value: statusData.uptime })} />
    </Container>
  );
}
