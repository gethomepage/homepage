import useSWR from "swr";
import { useTranslation } from "react-i18next";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Authentik({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: usersData, error: usersError } = useSWR(formatApiUrl(config, "core/users?page_size=1"));
  const { data: loginsData, error: loginsError } = useSWR(formatApiUrl(config, "events/events/per_month/?action=login&query={}"));
  const { data: failedLoginsData, error: failedLoginsError } = useSWR(formatApiUrl(config, "events/events/per_month/?action=login_failed&query={}"));

  if (usersError || loginsError || failedLoginsError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!usersData || !loginsData || !failedLoginsData) {
    return (
      <Widget>
        <Block label={t("authentik.users")} />
        <Block label={t("authentik.loginsLast24H")} />
        <Block label={t("authentik.failedLoginsLast24H")} />
      </Widget>
    );
  }

  const yesterday = new Date(Date.now()).setHours(-24);
  const loginsLast24H = loginsData.reduce(
    (total, current) => current.x_cord >= yesterday ? total + current.y_cord : total
  , 0);
  const failedLoginsLast24H = failedLoginsData.reduce(
    (total, current) => current.x_cord >= yesterday ? total + current.y_cord : total
  , 0);

  return (
    <Widget>
      <Block label={t("authentik.users")} value={t("common.number", { value: usersData.pagination.count })} />
      <Block label={t("authentik.loginsLast24H")} value={t("common.number", { value: loginsLast24H })} />
      <Block label={t("authentik.failedLoginsLast24H")} value={t("common.number", { value: failedLoginsLast24H })} />
    </Widget>
  );
}
