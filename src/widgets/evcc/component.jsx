import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: resultData, error: resultError } = useWidgetAPI(widget, "result");


  if (resultError) {
    return <Container service={service} error={resultError} />;
  }

  if (!resultData) {
    return (
      <Container service={service}>,
        <Block label="evcc.pvPower" />
        <Block label="evcc.batterySoc" />
        <Block label="evcc.gridpower" />
        <Block label="evcc.homepower" />
        <Block label="evcc.chargePower"/>
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="evcc.homepower" value={t("common.number", { value: resultData.result.homePower }) + " W"} />
      <Block label="evcc.batterySoc" value={t("common.number", { value: resultData.result.batterySoc }) + " %"} />
      <Block label="evcc.gridpower" value={t("common.number", { value: resultData.result.gridPower }) + " W"} />
      <Block label="evcc.homepower" value={t("common.number", { value: resultData.result.homePower }) + " W"} />
      <Block label="evcc.chargePower" value={t("common.number", { value: resultData.result.loadpoints[0].chargePower }) + " W"} />
    </Container>
  );
}