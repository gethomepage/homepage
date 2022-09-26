import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import { formatProxyUrl } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: statsData, error: statsError } = useSWR(formatProxyUrl(config, `instance`));

  if (statsError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!statsData) {
    return (
      <Container>
        <Block label={t("mastodon.user_count")} />
        <Block label={t("mastodon.status_count")} />
        <Block label={t("mastodon.domain_count")} />
      </Container>
    );
  }

  return (
    <Container>
      <Block label={t("mastodon.user_count")} value={t("common.number", { value: statsData.stats.user_count })} />
      <Block label={t("mastodon.status_count")} value={t("common.number", { value: statsData.stats.status_count })} />
      <Block label={t("mastodon.domain_count")} value={t("common.number", { value: statsData.stats.domain_count })} />
    </Container>
  );
}
