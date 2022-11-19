import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: homebridgeData, error: homebridgeError } = useWidgetAPI(widget, "info");

  if (homebridgeError) {
    return <Container error={homebridgeError} />;
  }

  if (!homebridgeData) {
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
        value={`${homebridgeData.status[0].toUpperCase()}${homebridgeData.status.substr(1)}`}
      />
      <Block
        label="homebridge.updates"
        value={
          (homebridgeData.updateAvailable || homebridgeData.plugins?.updatesAvailable)
            ? t("homebridge.update_available")
            : t("homebridge.up_to_date")}
      />
      {homebridgeData?.childBridges?.total > 0 &&
        <Block
          label="homebridge.child_bridges"
          value={t("homebridge.child_bridges_status", {
            total: homebridgeData.childBridges.total,
            ok: homebridgeData.childBridges.running
          })}
        />}
    </Container>
  );
}
