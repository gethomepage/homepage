import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  
  const { data, error } = useWidgetAPI(widget, "stats");
  
  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="frigate.cameras" />
        <Block label="frigate.uptime" />
        <Block label="frigate.version" />
      </Container>
    );
  };

  return (
    <Container service={service}>
      <Block
        label={data.num_cameras === 1 ? "frigate.camera" : "frigate.cameras"}
        value={t("common.number", {
          value: data.num_cameras,
        })}
      />
      <Block
        label="frigate.uptime"
        value={t("common.uptime", {
          value: data.uptime,
        })}
      />
      <Block
        label="frigate.version"
        value={data.version}
      />
    </Container>
  );
}
