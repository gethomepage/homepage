import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: resultData, error: resultError } = useWidgetAPI(widget, "upstreams");

  if (resultError) {
    return <Container service={service} error={resultError} />;
  }

  if (!resultData) {
    return (
      <Container service={service}>
        <Block label="caddy.upstreams" />
        <Block label="caddy.requests" />
        <Block label="caddy.requests_failed" />
      </Container>
    );
  }

  const upstreams = resultData.length;
  const requests = resultData.reduce((acc, val) => acc + val.num_requests, 0);
  const requestsFailed = resultData.reduce((acc, val) => acc + val.fails, 0);

  return (
    <Container service={service}>
      <Block label="caddy.upstreams" value={t("common.number", { value: upstreams })} />
      <Block label="caddy.requests" value={t("common.number", { value: requests })} />
      <Block label="caddy.requests_failed" value={t("common.number", { value: requestsFailed })} />
    </Container>
  );
}
