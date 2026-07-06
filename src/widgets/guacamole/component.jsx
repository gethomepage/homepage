import { useTranslation } from "next-i18next/pages";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: activeData, error: activeError } = useWidgetAPI(widget, "activeConnections");
  const { data: connectionsData, error: connectionsError } = useWidgetAPI(widget, "connections");
  const { data: usersData, error: usersError } = useWidgetAPI(widget, "users");

  const error = activeError ?? connectionsError ?? usersError;
  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!activeData || !connectionsData || !usersData) {
    return (
      <Container service={service}>
        <Block label="guacamole.active" />
        <Block label="guacamole.connections" />
        <Block label="guacamole.users" />
      </Container>
    );
  }

  const active = Object.keys(activeData).length;
  const connections = Object.keys(connectionsData).length;
  const users = Object.keys(usersData).length;

  return (
    <Container service={service}>
      <Block label="guacamole.active" value={t("common.number", { value: active })} />
      <Block label="guacamole.connections" value={t("common.number", { value: connections })} />
      <Block label="guacamole.users" value={t("common.number", { value: users })} />
    </Container>
  );
}
