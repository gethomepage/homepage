import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
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
  if ("battery.charge" in upsData) {
    upsData.battery_charge = upsData["battery.charge"];
  }
  if ("ups.load" in upsData) {
    upsData.ups_load = upsData["ups.load"];
  }
  if ("ups.status" in upsData) {
    upsData.ups_status = upsData["ups.status"];
  }

  let status;
  switch (upsData.ups_status) {
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
      status = upsData.ups_status;
  }

  return (
    <Container service={service}>
      <Block label="peanut.battery_charge" value={t("common.percent", { value: upsData.battery_charge })} />
      <Block label="peanut.ups_load" value={t("common.percent", { value: upsData.ups_load })} />
      <Block label="peanut.ups_status" value={status} />
    </Container>
  );
}
