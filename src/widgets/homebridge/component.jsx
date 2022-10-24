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
        <Block label="homebridge.updates" />
        <Block label="homebridge.child_bridges" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block
        label="widget.status"
        value={`${homebridge.data.status[0].toUpperCase()}${homebridge.data.status.substr(1)}`}
      />
      <Block
        label="homebridge.updates"
        value={
          (homebridge.data.updateAvailable || homebridge.data.plugins.updatesAvailable)
            ? t("homebridge.update_available")
            : t("homebridge.up_to_date")}
      />
      {homebridge?.data?.childBridges.quantity > 0 &&
        <Block
          label="homebridge.child_bridges"
          value={t("homebridge.child_bridges_status", {
            total: homebridge.data.childBridges.quantity,
            ok: homebridge.data.childBridges.quantityWithOkStatus
          })}
        />}
    </Container>
  );
}
