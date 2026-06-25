import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: usersData, error: usersError } = useWidgetAPI(widget, "users");
  const { data: clientsData, error: clientsError } = useWidgetAPI(widget, "oidcClients");

  if (usersError || clientsError) {
    return <Container service={service} error={usersError ?? clientsError} />;
  }

  if (!usersData || !clientsData) {
    return (
      <Container service={service}>
        <Block label="pocketid.users" />
        <Block label="pocketid.oidcClients" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="pocketid.users" value={t("common.number", { value: usersData.pagination.totalItems })} />
      <Block label="pocketid.oidcClients" value={t("common.number", { value: clientsData.pagination.totalItems })} />
    </Container>
  );
}
