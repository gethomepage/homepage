import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

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
      <Block label="openwrt.uptime" value={t("common.duration", { value: uptime })} />
      <Block label="openwrt.cpuLoad" value={cpuLoad} />
    </Container>
  );
}
