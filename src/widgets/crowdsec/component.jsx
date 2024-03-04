import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: bansData, error: bansError } = useWidgetAPI(widget, "bans");
  const { data: captchasData, error: captchasError } = useWidgetAPI(widget, "captchas");
  const { data: rateLimitsData, error: rateLimitsError } = useWidgetAPI(widget, "rateLimits");

  if (bansError || captchasError || rateLimitsError) {
    return <Container service={service} error={bansError ?? captchasError ?? rateLimitsError} />;
  }

  if (!bansData && !captchasData && !rateLimitsData) {
    return (
      <Container service={service}>
        <Block label="crowdsec.bans" />
        <Block label="crowdsec.captchas" />
        <Block label="crowdsec.rateLimits" />
      </Container>
    );
  }

  console.log(bansData);

  return (
    <Container service={service}>
      <Block label="crowdsec.bans" value={t("common.number", { value: bansData?.length ?? 0 })} />
      <Block label="crowdsec.captchas" value={t("common.number", { value: captchasData?.length ?? 0 })} />
      <Block label="crowdsec.rateLimits" value={t("common.number", { value: rateLimitsData?.length ?? 0 })} />
    </Container>
  );
}
