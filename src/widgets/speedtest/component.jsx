import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const endpoint = widget.version === 2 ? "latestv2" : "latestv1";
  const { data: speedtestData, error: speedtestError } = useWidgetAPI(widget, endpoint);

  const bitratePrecision =
    !widget?.bitratePrecision || Number.isNaN(widget?.bitratePrecision) || widget?.bitratePrecision < 0
      ? 0
      : widget.bitratePrecision;

  if (speedtestError || speedtestData?.error) {
    return <Container service={service} error={speedtestError ?? speedtestData.error} />;
  }

  if (!speedtestData?.data) {
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
          value: widget.version === 2 ? speedtestData.data.download * 8 : speedtestData.data.download * 1000 * 1000,
          decimals: bitratePrecision,
        })}
      />
      <Block
        label="speedtest.upload"
        value={t("common.bitrate", {
          value: widget.version === 2 ? speedtestData.data.upload * 8 : speedtestData.data.upload * 1000 * 1000,
          decimals: bitratePrecision,
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
