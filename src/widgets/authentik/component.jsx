import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: usersData, error: usersError } = useWidgetAPI(widget, "users");
  const { data: loginsData, error: loginsError } = useWidgetAPI(widget, "login");
  const { data: failedLoginsData, error: failedLoginsError } = useWidgetAPI(widget, "login_failed");

  if (usersError || loginsError || failedLoginsError) {
    const finalError = usersError ?? loginsError ?? failedLoginsError;
    return <Container error={finalError} />;
  }

  if (!usersData || !loginsData || !failedLoginsData) {
    return (
      <Container service={service}>
        <Block label="authentik.users" />
        <Block label="authentik.loginsLast24H" />
        <Block label="authentik.failedLoginsLast24H" />
      </Container>
    );
  }

  const yesterday = new Date(Date.now()).setHours(-24);
  const loginsLast24H = loginsData.reduce(
    (total, current) => (current.x_cord >= yesterday ? total + current.y_cord : total),
    0
  );
  const failedLoginsLast24H = failedLoginsData.reduce(
    (total, current) => (current.x_cord >= yesterday ? total + current.y_cord : total),
    0
  );

  return (
    <Container service={service}>
      <Block label="authentik.users" value={t("common.number", { value: usersData.pagination.count })} />
      <Block label="authentik.loginsLast24H" value={t("common.number", { value: loginsLast24H })} />
      <Block label="authentik.failedLoginsLast24H" value={t("common.number", { value: failedLoginsLast24H })} />
    </Container>
  );
}
