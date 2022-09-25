import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Widget from "../widget";
import Block from "../block";

import { formatProxyUrl } from "utils/api-helpers";

export default function Speedtest({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: speedtestData, error: speedtestError } = useSWR(formatProxyUrl(config, "speedtest/latest"));

  if (speedtestError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!speedtestData) {
    return (
      <Widget>
        <Block label={t("speedtest.download")} />
        <Block label={t("speedtest.upload")} />
        <Block label={t("speedtest.ping")} />
      </Widget>
    );
  }

  return (
    <Widget>
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
    </Widget>
  );
}
