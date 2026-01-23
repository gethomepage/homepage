import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: snowflakeData, error: snowflakeError } = useWidgetAPI(widget);

  if (snowflakeError) {
    return <Container service={service} error={snowflakeError} />;
  }

  if (!snowflakeData) {
    return (
      <Container service={service}>
        <Block label="snowflake.connections" />
        <Block label="snowflake.traffic_inbound" />
        <Block label="snowflake.traffic_outbound" />
        <Block label="snowflake.countries" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="snowflake.connections" value={t("common.number", { value: snowflakeData.connections_total })} />
      <Block
        label="snowflake.traffic_inbound"
        value={t("common.bytes", { value: snowflakeData.traffic_inbound_bytes })}
      />
      <Block
        label="snowflake.traffic_outbound"
        value={t("common.bytes", { value: snowflakeData.traffic_outbound_bytes })}
      />
      <Block label="snowflake.countries" value={t("common.number", { value: snowflakeData.countries_served })} />
    </Container>
  );
}
