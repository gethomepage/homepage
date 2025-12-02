import { useTranslation } from "next-i18next";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  // We use the "summary" mapping we defined in widget.js
  const { data, error } = useWidgetAPI(widget, "summary");

  if (error) {
    return <Container service={service} error={error} />;
  }

  // Skeleton view (Loading state)
  if (!data) {
    return (
      <Container service={service}>
        <Block label="Uptime" />
        <Block label="Infra" />
        <Block label="Incidents" />
      </Container>
    );
  }

  // Render actual data
  return (
    <Container service={service}>
      {/* Block 1: Active Monitors (uptime) */}
      <Block label="Uptime" value={t("common.number", { value: data.uptime })} />

      {/* Block 2: Hardware (infrastructure) */}
      <Block label="Infra" value={t("common.number", { value: data.infrastructure })} />

      {/* Block 3: Incidents */}
      {/* We can add a specialized className to color this red if > 0 later */}
      <Block label="Incidents" value={t("common.number", { value: data.incidents })} />
    </Container>
  );
}
