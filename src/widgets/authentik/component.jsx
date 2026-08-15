import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: usersData, error: usersError } = useWidgetAPI(widget, "users");

  let loginsError;
  let failedLoginsError;
  let authorizationsError;
  let loginsData;
  let failedLoginsData;
  let authorizationsData;

  if (widget.version === 2) {
    const v2DataResult = useWidgetAPI(widget, "datav2");

    loginsError = v2DataResult.error;
    loginsData = v2DataResult.data;
  } else {
    const v1LoginsResult = useWidgetAPI(widget, "login");
    const v1FailedLoginsResult = useWidgetAPI(widget, "login_failed");
    const v1AuthsResult = useWidgetAPI(widget, "authorizations");

    loginsError = v1LoginsResult.error;
    loginsData = v1LoginsResult.data;
    failedLoginsError = v1FailedLoginsResult.error;
    failedLoginsData = v1FailedLoginsResult.data;
    authorizationsError = v1AuthsResult.error;
    authorizationsData = v1AuthsResult.data;
  }

  if (usersError || loginsError || failedLoginsError || authorizationsError) {
    const finalError = usersError ?? loginsError ?? failedLoginsError ?? authorizationsError;
    return <Container service={service} error={finalError} />;
  }

  const hasNoData =
    widget.version === 2
      ? !usersData || !loginsData
      : !usersData || !loginsData || !failedLoginsData || !authorizationsData;

  if (hasNoData) {
    return (
      <Container service={service}>
        <Block label="authentik.users" />
        <Block label="authentik.loginsLast24H" />
        <Block label="authentik.failedLoginsLast24H" />
        <Block label="authentik.authorizationsLast24H" />
      </Container>
    );
  }

  let loginsLast24H;
  let failedLoginsLast24H;
  let authorizationsLast24H;
  switch (widget.version) {
    // v1 is default
    default:
      const yesterday = new Date(Date.now()).setHours(-24);
      loginsLast24H = loginsData.reduce(
        (total, current) => (current.x_cord >= yesterday ? total + current.y_cord : total),
        0,
      );
      failedLoginsLast24H = failedLoginsData.reduce(
        (total, current) => (current.x_cord >= yesterday ? total + current.y_cord : total),
        0,
      );
      authorizationsLast24H =
        authorizationsData.reduce?.(
          (total, current) => (current.x_cord >= yesterday ? total + current.y_cord : total),
          0,
        ) || 0;
      break;
    case 2:
      const result = loginsData.reduce(
        (acc, current) => {
          if (!current?.count || !current?.action) {
            return acc;
          }

          if (current.action === "login") {
            acc.logins += current.count;
          } else if (current.action === "login_failed") {
            acc.failed += current.count;
          } else if (current.action === "authorize_application") {
            acc.authorizations += current.count;
          }

          return acc;
        },
        { logins: 0, failed: 0, authorizations: 0 },
      );
      loginsLast24H = result.logins;
      failedLoginsLast24H = result.failed;
      authorizationsLast24H = result.authorizations;
      break;
  }

  return (
    <Container service={service}>
      <Block label="authentik.users" value={t("common.number", { value: usersData.pagination.count })} />
      <Block label="authentik.loginsLast24H" value={t("common.number", { value: loginsLast24H })} />
      <Block label="authentik.failedLoginsLast24H" value={t("common.number", { value: failedLoginsLast24H })} />
      <Block label="authentik.authorizationsLast24H" value={t("common.number", { value: authorizationsLast24H })} />
    </Container>
  );
}
