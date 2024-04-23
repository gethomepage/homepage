import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

const DEFAULT_BITRATE_NUM_OF_DECIMAL_PLACES = 2;

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: speedtestData, error: speedtestError } = useWidgetAPI(widget, "speedtest/latest");

  let bitrateNumOfDecimalPlaces = widget?.bitrateNumOfDecimalPlaces ?? DEFAULT_BITRATE_NUM_OF_DECIMAL_PLACES; // Default is 2

  // if not a number or negative, set to default
  if (bitrateNumOfDecimalPlaces < 0) {
    bitrateNumOfDecimalPlaces = DEFAULT_BITRATE_NUM_OF_DECIMAL_PLACES;
  }

  if (speedtestError) {
    return <Container service={service} error={speedtestError} />;
  }

  if (!speedtestData) {
    return (
      <Container service={service}>
        <Block label="speedtest.download" />
        <Block label="speedtest.upload" />
        <Block label="speedtest.ping" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block
        label="speedtest.download"
        value={t("common.bitrate", {
          value: speedtestData.data.download * 1000 * 1000,
          decimals: bitrateNumOfDecimalPlaces,
        })}
      />
      <Block
        label="speedtest.upload"
        value={t("common.bitrate", {
          value: speedtestData.data.upload * 1000 * 1000,
          decimals: bitrateNumOfDecimalPlaces,
        })}
      />
      <Block
        label="speedtest.ping"
        value={t("common.ms", {
          value: speedtestData.data.ping,
          style: "unit",
          unit: "millisecond",
        })}
      />
    </Container>
  );
}
