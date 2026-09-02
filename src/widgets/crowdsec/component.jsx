import { useTranslation } from "next-i18next/pages";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

const ALERTS_LIMIT = 500;

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: alerts, error: alertsError } = useWidgetAPI(widget, "alerts");
  const { data: bans, error: bansError } = useWidgetAPI(widget, "bans");

  const alertsCount = alerts?.length ?? 0;
  const alertsValue = t("common.number", { value: alertsCount });

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
      <Block label="crowdsec.alerts" value={alertsCount >= ALERTS_LIMIT ? `${alertsValue}+` : alertsValue} />
      <Block label="crowdsec.bans" value={t("common.number", { value: bans?.length ?? 0 })} />
    </Container>
  );
}
