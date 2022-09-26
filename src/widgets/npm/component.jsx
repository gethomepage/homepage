import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import { formatProxyUrl } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: infoData, error: infoError } = useSWR(formatProxyUrl(config, "nginx/proxy-hosts"));

  if (infoError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!infoData) {
    return (
      <Container>
        <Block label={t("npm.enabled")} />
        <Block label={t("npm.disabled")} />
        <Block label={t("npm.total")} />
      </Container>
    );
  }

  const enabled = infoData.filter((c) => c.enabled === 1).length;
  const disabled = infoData.filter((c) => c.enabled === 0).length;
  const total = infoData.length;

  return (
    <Container>
      <Block label={t("npm.enabled")} value={enabled} />
      <Block label={t("npm.disabled")} value={disabled} />
      <Block label={t("npm.total")} value={total} />
    </Container>
  );
}
