import { useTranslation } from "next-i18next";
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";

import useWidgetAPI from "utils/proxy/use-widget-api";

export const slskdDefaultFields = ["slskStatus", "downloads", "uploads", "sharedFiles"];
const MAX_ALLOWED_FIELDS = 4;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: appData, error: appError } = useWidgetAPI(widget, "application");
  const { data: downData, error: downError } = useWidgetAPI(widget, "downloads");
  const { data: upData, error: upError } = useWidgetAPI(widget, "uploads");

  if (appError || downError || upError) {
    return <Container service={service} error={appError || downError || upError} />;
  }

  if (!widget.fields || widget.fields.length === 0) {
    widget.fields = slskdDefaultFields;
  } else if (widget.fields?.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  if (!appData || !downData || !upData) {
    return (
      <Container service={service}>
        <Block label="slskd.slskStatus" />
        <Block label="slskd.updateStatus" />
        <Block label="slskd.downloads" />
        <Block label="slskd.uploads" />
        <Block label="slskd.sharedFiles" />
      </Container>
    );
  }

  const slskStatus = appData.serverStatus ? t("slskd.connected") : t("slskd.disconnected");
  const updateStatus = appData.updateStatus ? t("slskd.update_yes") : t("slskd.update_no");
  const downloads = downData?.length !== undefined ? downData?.length : 0;
  const uploads = upData?.length !== undefined ? upData?.length : 0;

  return (
    <Container service={service}>
      <Block label="slskd.slskStatus" value={slskStatus} />
      <Block label="slskd.updateStatus" value={updateStatus} />
      <Block label="slskd.downloads" value={t("common.number", { value: downloads })} />
      <Block label="slskd.uploads" value={t("common.number", { value: uploads })} />
      <Block label="slskd.sharedFiles" value={t("common.number", { value: appData.filesShared })} />
    </Container>
  );
}
