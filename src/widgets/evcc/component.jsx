import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

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

  // evcc v0.207 changed the API structure so its no longer under 'result'
  const data = stateData.result ?? stateData;

  // broken by evcc v0.133.0 https://github.com/evcc-io/evcc/commit/9dcb1fa0a7c08dd926b79309aa1f676a5fc6c8aa
  const gridPower = data.gridPower ?? data.grid?.power ?? 0;

  // Sum chargePower of all loadpoints
  const totalChargePower = Array.isArray(data.loadpoints)
    ? data.loadpoints.reduce((sum, lp) => sum + (lp.chargePower ?? 0), 0)
    : 0;

  return (
    <Container service={service}>
      <Block label="evcc.pv_power" value={`${toKilowatts(t, data.pvPower)} ${t("evcc.kilowatt")}`} />
      <Block label="evcc.grid_power" value={`${toKilowatts(t, gridPower)} ${t("evcc.kilowatt")}`} />
      <Block label="evcc.home_power" value={`${toKilowatts(t, data.homePower)} ${t("evcc.kilowatt")}`} />
      <Block label="evcc.charge_power" value={`${toKilowatts(t, totalChargePower)} ${t("evcc.kilowatt")}`} />
    </Container>
  );
}
