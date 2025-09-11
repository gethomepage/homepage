import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: usersData, error: usersError } = useWidgetAPI(widget, "users");

  const loginsEndpoint = widget.version === 2 ? "loginv2" : "login";
  const { data: loginsData, error: loginsError } = useWidgetAPI(widget, loginsEndpoint);

  const failedLoginsEndpoint = widget.version === 2 ? "login_failedv2" : "login_failed";
  const { data: failedLoginsData, error: failedLoginsError } = useWidgetAPI(widget, failedLoginsEndpoint);

  if (usersError || loginsError || failedLoginsError) {
    const finalError = usersError ?? loginsError ?? failedLoginsError;
    return <Container service={service} error={finalError} />;
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

  let loginsLast24H;
  let failedLoginsLast24H;
  switch (widget.version) {
    case 1:
      const yesterday = new Date(Date.now()).setHours(-24);
      loginsLast24H = loginsData.reduce(
        (total, current) => (current.x_cord >= yesterday ? total + current.y_cord : total),
        0,
      );
      failedLoginsLast24H = failedLoginsData.reduce(
        (total, current) => (current.x_cord >= yesterday ? total + current.y_cord : total),
        0,
      );
      break;
    case 2:
      loginsLast24H = loginsData[0]?.count || 0;
      failedLoginsLast24H = failedLoginsData[0]?.count || 0;
      break;
  }

  return (
    <Container service={service}>
      <Block label="authentik.users" value={t("common.number", { value: usersData.pagination.count })} />
      <Block label="authentik.loginsLast24H" value={t("common.number", { value: loginsLast24H })} />
      <Block label="authentik.failedLoginsLast24H" value={t("common.number", { value: failedLoginsLast24H })} />
    </Container>
  );
}
