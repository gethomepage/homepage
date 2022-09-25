import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Nzbget({ service }) {
  const { t } = useTranslation("common");

  const config = service.widget;

  const { data: statusData, error: statusError } = useSWR(formatApiUrl(config, "status"));

  if (statusError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!statusData) {
    return (
      <Widget>
        <Block label={t("nzbget.rate")} />
        <Block label={t("nzbget.remaining")} />
        <Block label={t("nzbget.downloaded")} />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label={t("nzbget.rate")} value={t("common.bitrate", { value: statusData.DownloadRate })} />
      <Block
        label={t("nzbget.remaining")}
        value={t("common.bytes", { value: statusData.RemainingSizeMB * 1024 * 1024 })}
      />
      <Block
        label={t("nzbget.downloaded")}
        value={t("common.bytes", { value: statusData.DownloadedSizeMB * 1024 * 1024 })}
      />
    </Widget>
  );
}
