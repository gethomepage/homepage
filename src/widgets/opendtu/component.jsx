import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: opendtuData, error: opendtuError } = useWidgetAPI(widget);

  if (opendtuError) {
    return <Container service={service} error={opendtuError} />;
  }

  if (!opendtuData) {
    return (
      <Container service={service}>
        <Block label="opendtu.yieldDay" />
        <Block label="opendtu.relativePower" />
        <Block label="opendtu.absolutePower" />
        <Block label="opendtu.limit" />
      </Container>
    );
  }

  const yieldDay = opendtuData.total.YieldDay.v;
  const yieldDayUnit = opendtuData.total.YieldDay.u;

  const power = opendtuData.total.Power.v;
  const powerUnit = opendtuData.total.Power.u;

  const totalLimit = opendtuData.inverters.map((inverter) => inverter.limit_absolute).reduce((a, b) => a + b);
  const totalLimitUnit = "W";

  const powerPercentage = (power / totalLimit) * 100;

  return (
    <Container service={service}>
      <Block
        label="opendtu.yieldDay"
        value={`${t("common.number", { value: Math.round(yieldDay), style: "unit" })}${yieldDayUnit}`}
      />
      <Block
        label="opendtu.relativePower"
        value={t("common.number", { value: Math.round(powerPercentage), style: "unit", unit: "percent" })}
      />
      <Block
        label="opendtu.absolutePower"
        value={`${t("common.number", { value: Math.round(power), style: "unit" })}${powerUnit}`}
      />
      <Block
        label="opendtu.limit"
        value={`${t("common.number", { value: Math.round(totalLimit), style: "unit" })}${totalLimitUnit}`}
      />
    </Container>
  );
}
