import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: nextcloudData, error: nextcloudError } = useWidgetAPI(widget, "serverinfo");

  if (nextcloudError) {
    return <Container service={service} error={nextcloudError} />;
  }
  
  // cpuload & memoryusage were deprecated, dont break existing installs & dont have > 4 blocks total
  let deprecatedFieldsCount = widget.fields ? widget.fields.includes('cpuload') + widget.fields.includes('memoryusage') : 0;
  if (widget.fields && widget.fields.length - deprecatedFieldsCount < 4) deprecatedFieldsCount -= 4 - (widget.fields.length - deprecatedFieldsCount);

  if (!nextcloudData) {
    return (
      <Container service={service}>
        {widget.fields?.includes('cpuload') && <Block label="nextcloud.cpuload" />}
        {widget.fields?.includes('memoryusage') && <Block label="nextcloud.memoryusage" />}
        <Block label="nextcloud.freespace" />
        <Block label="nextcloud.activeusers" />
        {deprecatedFieldsCount < 2 && <Block label="nextcloud.numfiles" />}
        {deprecatedFieldsCount < 1 && <Block label="nextcloud.numshares" />}
      </Container>
    );
  }

  const nextcloudInfo =  nextcloudData.ocs.data.nextcloud;
  const memoryUsage = 100 * ((parseFloat(nextcloudInfo.system.mem_total) - parseFloat(nextcloudInfo.system.mem_free)) / parseFloat(nextcloudInfo.system.mem_total));

  return (
    <Container service={service}>
      {widget.fields?.includes('cpuload') && <Block label="nextcloud.cpuload" value={t("common.percent", { value: nextcloudInfo.system.cpuload[0] })} />}
      {widget.fields?.includes('memoryusage') && <Block label="nextcloud.memoryusage" value={t("common.percent", { value:memoryUsage })} />}
      <Block label="nextcloud.freespace" value={t("common.bbytes", { value: nextcloudInfo.system.freespace, maximumFractionDigits: 1 })} />
      <Block label="nextcloud.activeusers" value={t("common.number", { value: nextcloudData.ocs.data.activeUsers.last24hours })} />
      {deprecatedFieldsCount < 2 && <Block label="nextcloud.numfiles" value={t("common.number", { value: nextcloudInfo.storage.num_files })} />}
      {deprecatedFieldsCount < 1 && <Block label="nextcloud.numshares" value={t("common.number", { value: nextcloudInfo.shares.num_shares })} />}
    </Container>
  );
}
