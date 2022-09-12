import useSWR from "swr";
import { useTranslation } from "react-i18next";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Sabnzbd({ service }) {
  const { t } = useTranslation("common");

  const config = service.widget;
  const { data: statusData, error: statusError } = useSWR(formatApiUrl(config, "mode=queue"));

  if (statusError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!statusData) {
    return (
      <Widget>
        <Block label={t("sabnzbd.status")} />
        <Block label={t("sabnzbd.speed")} />
        <Block label={t("sabnzbd.remaining")} />
        <Block label={t("sabnzbd.timeleft")} />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label={t("sabnzbd.status")} value={statusData?.queue?.status } />
      <Block label={t("sabnzbd.speed")} value={statusData?.queue?.speed } />
      <Block
        label={t("sabnzbd.remaining")}
        value={t("common.bytes", { value: statusData?.queue?.mbleft * 1024 * 1024 })}
      />
      <Block label={t("sabnzbd.timeleft")} value={statusData?.queue?.timeleft} />
    </Widget>
  );
}
