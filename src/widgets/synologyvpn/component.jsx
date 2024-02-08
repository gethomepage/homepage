import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { data: gatewayData, error: gatewayError } = useWidgetAPI(widget, "gatewayList");

  if (gatewayError) {
    return <Container service={service} error={gatewayError} />;
  }

  const configs = gatewayData?.data?.configs || [];
  const isVPNConnected = configs.some(config => config.class === "vpn-client");

  return (
    <Container service={service}>
      <Block label="VPN connection status" value={isVPNConnected ? t("Connected") : t("Disconnected")} />
    </Container>
  );
}
