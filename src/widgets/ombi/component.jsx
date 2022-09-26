import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import { formatProxyUrl } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: statsData, error: statsError } = useSWR(formatProxyUrl(config, `Request/count`));

  if (statsError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!statsData) {
    return (
      <Container>
        <Block label={t("ombi.pending")} />
        <Block label={t("ombi.approved")} />
        <Block label={t("ombi.available")} />
      </Container>
    );
  }

  return (
    <Container>
      <Block label={t("ombi.pending")} value={statsData.pending} />
      <Block label={t("ombi.approved")} value={statsData.approved} />
      <Block label={t("ombi.available")} value={statsData.available} />
    </Container>
  );
}
