import { useTranslation } from "next-i18next";
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { data, error } = useWidgetAPI(widget, "info");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label={t("watchyourlan.total")} />
        <Block label={t("watchyourlan.online")} />
        <Block label={t("watchyourlan.offline")} />
        <Block label={t("watchyourlan.unknown")} />
        <Block label={t("watchyourlan.known")} />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label={t("watchyourlan.total")} value={data.Total} />
      <Block label={t("watchyourlan.online")} value={data.Online} />
      <Block label-{t("watchyourlan.offline")} value={data.Offline} />
      <Block label={t("watchyourlan.unknown")} value={data.Unknown} />
      <Block label={t("watchyourlan.known")] value={data.Known} />
    </Container>
  );
}