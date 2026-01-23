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
        <Block label="snowflake.traffic" />
        <Block label="snowflake.countries" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block
        label="snowflake.connections"
        value={t("common.number", { value: snowflakeData.connections_total })}
      />
      <Block label="snowflake.traffic" value={t("common.bytes", { value: snowflakeData.traffic_total_bytes })} />
      <Block label="snowflake.countries" value={t("common.number", { value: snowflakeData.countries_served })} />
    </Container>
  );
}
