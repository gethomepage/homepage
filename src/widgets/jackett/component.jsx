import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import { formatProxyUrl } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: indexersData, error: indexersError } = useSWR(formatProxyUrl(config, "indexers"));

  if (indexersError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!indexersData) {
    return (
      <Container>
        <Block label={t("jackett.configured")} />
        <Block label={t("jackett.errored")} />
      </Container>
    );
  }

  const errored = indexersData.filter((indexer) => indexer.last_error);

  return (
    <Container>
      <Block label={t("jackett.configured")} value={t("common.number", { value: indexersData.length })} />
      <Block label={t("jackett.errored")} value={t("common.number", { value: errored.length })} />
    </Container>
  );
}
