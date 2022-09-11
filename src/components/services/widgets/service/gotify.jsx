import useSWR from "swr";
import { useTranslation } from "react-i18next";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Gotify({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: appsData, error: appsError } = useSWR(formatApiUrl(config, `application`));
  const { data: messagesData, error: messagesError } = useSWR(formatApiUrl(config, `message`));
  const { data: clientsData, error: clientsError } = useSWR(formatApiUrl(config, `client`));

  if (appsError || messagesError || clientsError) {
    return <Widget error={t("widget.api_error")} />;
  }

  return (
    <Widget>
      <Block label={t("gotify.apps")} value={appsData?.length} />
      <Block label={t("gotify.clients")} value={clientsData?.length} />
      <Block label={t("gotify.messages")} value={messagesData?.messages?.length} />
    </Widget>
  );
}
