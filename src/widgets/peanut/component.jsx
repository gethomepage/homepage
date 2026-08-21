import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;
  const { t } = useTranslation();

  const { data: upsData, error: upsError } = useWidgetAPI(widget, "devices");

  if (upsError) {
    return <Container service={service} error={upsError} />;
  }

  if (!upsData) {
    return (
      <Container service={service}>
        <Block label="peanut.battery_charge" />
        <Block label="peanut.ups_load" />
        <Block label="peanut.ups_status" />
      </Container>
    );
  }

  // backwards compatibility with peanut v1
  const batteryCharge = "battery.charge" in upsData ? upsData["battery.charge"] : upsData.battery_charge;
  const upsLoad = "ups.load" in upsData ? upsData["ups.load"] : upsData.ups_load;
  const upsStatus = "ups.status" in upsData ? upsData["ups.status"] : upsData.ups_status;

  let status;
  switch (upsStatus) {
    case "OL":
      status = t("peanut.online");
      break;
    case "OB":
      status = t("peanut.on_battery");
      break;
    case "LB":
      status = t("peanut.low_battery");
      break;
    default:
      status = upsStatus;
  }

  return (
    <Container service={service}>
      <Block
        label="peanut.battery_charge"
        value={t("common.percent", { value: batteryCharge })}
        highlightValue={batteryCharge}
      />
      <Block label="peanut.ups_load" value={t("common.percent", { value: upsLoad })} highlightValue={upsLoad} />
      <Block label="peanut.ups_status" value={status} />
    </Container>
  );
}
