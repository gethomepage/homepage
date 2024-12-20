import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

function toKilowatts(t, value) {
  return value > 0 ? t("common.number", { value: value / 1000, maximumFractionDigits: 1 }) : 0;
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: stateData, error: stateError } = useWidgetAPI(widget, "state");

  if (stateError) {
    return <Container service={service} error={stateError} />;
  }

  if (!stateData) {
    return (
      <Container service={service}>
        <Block label="evcc.pv_power" />
        <Block label="evcc.grid_power" />
        <Block label="evcc.home_power" />
        <Block label="evcc.charge_power" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="evcc.pv_power" value={`${toKilowatts(t, stateData.result.pvPower)} ${t("evcc.kilowatt")}`} />
      <Block label="evcc.grid_power" value={`${toKilowatts(t, stateData.result.gridPower)} ${t("evcc.kilowatt")}`} />
      <Block label="evcc.home_power" value={`${toKilowatts(t, stateData.result.homePower)} ${t("evcc.kilowatt")}`} />
      <Block
        label="evcc.charge_power"
        value={`${toKilowatts(t, stateData.result.loadpoints[0].chargePower)} ${t("evcc.kilowatt")}`}
      />
    </Container>
  );
}
