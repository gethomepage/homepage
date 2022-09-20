import useSWR from "swr";
import { useTranslation } from "react-i18next";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Peertube({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: statsData, error: statsError } = useSWR(formatApiUrl(config, `server/stats`));

  if (statsError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!statsData) {
    return (
      <Widget>
        <Block label={t("peertube.totalUsers")} />
        <Block label={t("peertube.totalVideos")} />
        <Block label={t("peertube.totalLocalVideoFilesSize")} />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label={t("peertube.totalUsers")}               value={t("common.number", { value: statsData.totalUsers })} />
      <Block label={t("peertube.totalVideos")}              value={t("common.number", { value: statsData.totalVideos })} />
      <Block label={t("peertube.totalLocalVideoFilesSize")} value={t("common.bytes", { value: statsData.totalLocalVideoFilesSize })} />
    </Widget>
  );
}
