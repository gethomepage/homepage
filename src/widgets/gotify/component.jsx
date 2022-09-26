import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import { formatProxyUrl } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: appsData, error: appsError } = useSWR(formatProxyUrl(config, `application`));
  const { data: messagesData, error: messagesError } = useSWR(formatProxyUrl(config, `message`));
  const { data: clientsData, error: clientsError } = useSWR(formatProxyUrl(config, `client`));

  if (appsError || messagesError || clientsError) {
    return <Container error={t("widget.api_error")} />;
  }

  return (
    <Container>
      <Block label={t("gotify.apps")} value={appsData?.length} />
      <Block label={t("gotify.clients")} value={clientsData?.length} />
      <Block label={t("gotify.messages")} value={messagesData?.messages?.length} />
    </Container>
  );
}
