import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "stats");
  const { data: bandwidthData, error: bandwidthError } = useWidgetAPI(widget, "stats/bandwidth");

  if (statsError || bandwidthError) {
    return <Container service={service} error={statsError || bandwidthError} />;
  }

  if (!statsData || !bandwidthData) {
    return (
      <Container service={service}>
        <Block label="remnawave.onlineNow" />
        <Block label="remnawave.nodesOnline" />
        <Block label="remnawave.bandwidthToday" />
        <Block label="remnawave.bandwidthSevenDays" />
      </Container>
    );
  }

  const onlineNow = statsData.response?.onlineStats?.onlineNow ?? 0;
  const nodesOnline = statsData.response?.nodes?.totalOnline ?? 0;
  const bandwidthToday = parseInt(bandwidthData.response?.bandwidthLastTwoDays?.current ?? "0", 10);
  const bandwidthSevenDays = parseInt(bandwidthData.response?.bandwidthLastSevenDays?.current ?? "0", 10);

  return (
    <Container service={service}>
      <Block label="remnawave.onlineNow" value={t("common.number", { value: onlineNow })} />
      <Block label="remnawave.nodesOnline" value={t("common.number", { value: nodesOnline })} />
      <Block label="remnawave.bandwidthToday" value={t("common.bytes", { value: bandwidthToday })} />
      <Block label="remnawave.bandwidthSevenDays" value={t("common.bytes", { value: bandwidthSevenDays })} />
    </Container>
  );
}
