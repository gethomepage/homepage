import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: homebridge, error: homebridgeError } = useWidgetAPI(widget, "info");

  if (homebridgeError || (homebridge && !homebridge.data)) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!homebridge) {
    return (
      <Container service={service}>
        <Block label="widget.status" />
        <Block label="homebridge.available_plugin_updates" />
        <Block label="homebridge.available_homebridge_update" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block
        label="widget.status"
        value={homebridge.data.status}
      />
      <Block
        label="homebridge.available_update"
        value={homebridge.data.updateAvailable ? t("homebridge.update_available") : t("homebridge.up_to_date")}
      />
      <Block
        label="homebridge.available_homebridge_update"
        value={homebridge.data.plugins.updatesAvailable ? t("homebridge.plugins_updates_available", { quantity: homebridge.data.plugins.quantity }) : t("homebridge.plugins_up_to_date")}
      />
    </Container>
  );
}
