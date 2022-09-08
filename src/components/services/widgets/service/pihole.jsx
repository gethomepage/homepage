import useSWR from "swr";
import { useTranslation } from "react-i18next";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Pihole({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: piholeData, error: piholeError } = useSWR(formatApiUrl(config, "api.php"));

  if (piholeError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!piholeData) {
    return (
      <Widget>
        <Block label={t("pihole.queries")} />
        <Block label={t("pihole.blocked")} />
        <Block label={t("pihole.gravity")} />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label={t("pihole.queries")} value={t("common.number", { value: piholeData.dns_queries_today })} />
      <Block label={t("pihole.blocked")} value={t("common.number", { value: piholeData.ads_blocked_today })} />
      <Block label={t("pihole.gravity")} value={t("common.number", { value: piholeData.domains_being_blocked })} />
    </Widget>
  );
}
