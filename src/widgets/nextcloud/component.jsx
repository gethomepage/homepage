import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: nextcloudData, error: nextcloudError } = useWidgetAPI(widget, "serverinfo");

  if (nextcloudError) {
    return <Container error={nextcloudError} />;
  }

  if (!nextcloudData) {
    return (
      <Container service={service}>
        <Block label="nextcloud.cpuload" />
        <Block label="nextcloud.memoryusage" />
        <Block label="nextcloud.freespace" />
        <Block label="nextcloud.activeusers" />
        <Block label="nextcloud.shares" />
      </Container>
    );
  }

  const nextcloudInfo =  nextcloudData.ocs.data.nextcloud;
  const memoryUsage = 100 * ((parseFloat(nextcloudInfo.system.mem_total) - parseFloat(nextcloudInfo.system.mem_free)) / parseFloat(nextcloudInfo.system.mem_total));

  return (
    <Container service={service}>
      <Block label="nextcloud.cpuload" value={t("common.percent", { value: nextcloudInfo.system.cpuload[0] })} />
      <Block label="nextcloud.memoryusage" value={t("common.percent", { value:memoryUsage })} />
      <Block label="nextcloud.freespace" value={t("common.bbytes", { value: nextcloudInfo.system.freespace, maximumFractionDigits: 1 })} />
      <Block label="nextcloud.activeusers" value={t("common.number", { value: nextcloudData.ocs.data.activeUsers.last5minutes })} />
      <Block label="nextcloud.shares" value={t("common.number", { value: nextcloudInfo.shares.num_shares })} />
    </Container>
  );
}
