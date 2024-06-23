import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { data, error } = useWidgetAPI(widget, "info");

  if (error || (data && data.message) || (data && data[0] && data[0].error)) {
    let finalError = error ?? data;
    if (data && data[0] && data[0].error) {
      try {
        finalError = JSON.parse(data[0].error);
      } catch (e) {
        finalError = data[0].error;
      }
    }
    return <Container service={service} error={finalError} />;
  }

  if (!data || (data && data.length === 0)) {
    return (
      <Container service={service}>
        <Block label="myspeed.ping" />
        <Block label="myspeed.download" />
        <Block label="myspeed.upload" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block
        label="myspeed.ping"
        value={t("common.ms", {
          value: data[0].ping,
          style: "unit",
          unit: "millisecond",
        })}
      />
      <Block
        label="myspeed.download"
        value={t("common.bitrate", {
          value: data[0].download * 1000 * 1000,
          decimals: 2,
        })}
      />
      <Block
        label="myspeed.upload"
        value={t("common.bitrate", {
          value: data[0].upload * 1000 * 1000,
          decimals: 2,
        })}
      />
    </Container>
  );
}
