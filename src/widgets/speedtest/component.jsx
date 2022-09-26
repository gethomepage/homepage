import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import { formatProxyUrl } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: speedtestData, error: speedtestError } = useSWR(formatProxyUrl(config, "speedtest/latest"));

  if (speedtestError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!speedtestData) {
    return (
      <Container>
        <Block label={t("speedtest.download")} />
        <Block label={t("speedtest.upload")} />
        <Block label={t("speedtest.ping")} />
      </Container>
    );
  }

  return (
    <Container>
      <Block
        label={t("speedtest.download")}
        value={t("common.bitrate", { value: speedtestData.data.download * 1024 * 1024 })}
      />
      <Block
        label={t("speedtest.upload")}
        value={t("common.bitrate", { value: speedtestData.data.upload * 1024 * 1024 })}
      />
      <Block
        label={t("speedtest.ping")}
        value={t("common.ms", { value: speedtestData.data.ping, style: "unit", unit: "millisecond" })}
      />
    </Container>
  );
}
