import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: alerts, error: alertsError } = useWidgetAPI(widget, "alerts");
  const { data: bans, error: bansError } = useWidgetAPI(widget, "bans");

  if (alertsError || bansError) {
    return <Container service={service} error={alertsError ?? bansError} />;
  }

  if (!alerts && !bans) {
    return (
      <Container service={service}>
        <Block label="crowdsec.alerts" />
        <Block label="crowdsec.bans" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="crowdsec.alerts" value={t("common.number", { value: alerts?.length ?? 0 })} />
      <Block label="crowdsec.bans" value={t("common.number", { value: bans?.length ?? 0 })} />
    </Container>
  );
}
