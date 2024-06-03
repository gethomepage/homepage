import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

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
      <Block
        label="evcc.pv_power"
        value={`${t("common.number", { value: stateData.result.pvPower })} ${t("evcc.watt_hour")}`}
      />
      <Block
        label="evcc.grid_power"
        value={`${t("common.number", { value: stateData.result.gridPower })} ${t("evcc.watt_hour")}`}
      />
      <Block
        label="evcc.home_power"
        value={`${t("common.number", { value: stateData.result.homePower })} ${t("evcc.watt_hour")}`}
      />
      <Block
        label="evcc.charge_power"
        value={`${t("common.number", { value: stateData.result.loadpoints[0].chargePower })} ${t("evcc.watt_hour")}`}
      />
    </Container>
  );
}
