import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import { formatProxyUrl } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: traefikData, error: traefikError } = useSWR(formatProxyUrl(config, "overview"));

  if (traefikError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!traefikData) {
    return (
      <Container>
        <Block label={t("traefik.routers")} />
        <Block label={t("traefik.services")} />
        <Block label={t("traefik.middleware")} />
      </Container>
    );
  }

  return (
    <Container>
      <Block label={t("traefik.routers")} value={traefikData.http.routers.total} />
      <Block label={t("traefik.services")} value={traefikData.http.services.total} />
      <Block label={t("traefik.middleware")} value={traefikData.http.middlewares.total} />
    </Container>
  );
}
