import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { data, error } = useWidgetAPI(service.widget);

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return null;
  }

  const { uptime, cpuLoad } = data;

  return (
    <Container service={service}>
      <Block
        label="openwrt.uptime"
        value={t("openwrt.uptimeValue", {
          days: Math.floor(uptime / 86400),
          hours: Math.floor((uptime % 86400) / 3600),
          minutes: Math.floor((uptime % 3600) / 60),
          seconds: uptime % 60,
        })}
      />
      <Block label="openwrt.cpuLoad" value={cpuLoad} />
    </Container>
  );
}
