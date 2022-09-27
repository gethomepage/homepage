import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: piholeData, error: piholeError } = useWidgetAPI(widget, "api.php");

  if (piholeError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!piholeData) {
    return (
      <Container>
        <Block label={t("pihole.queries")} />
        <Block label={t("pihole.blocked")} />
        <Block label={t("pihole.gravity")} />
      </Container>
    );
  }

  return (
    <Container>
      <Block label={t("pihole.queries")} value={t("common.number", { value: piholeData.dns_queries_today })} />
      <Block label={t("pihole.blocked")} value={t("common.number", { value: piholeData.ads_blocked_today })} />
      <Block label={t("pihole.gravity")} value={t("common.number", { value: piholeData.domains_being_blocked })} />
    </Container>
  );
}
