import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { version = 1 } = widget;

  const versionEndpoint = version === 2 ? "version_v2" : "version";

  const { data: versionData, error: versionError } = useWidgetAPI(widget, versionEndpoint);

  let statsEndpoint = version === 2 ? "statistics_v2" : "stats";
  if (version === 1) {
    // see https://github.com/gethomepage/homepage/issues/2282
    statsEndpoint =
      versionData?.major > 1 || (versionData?.major === 1 && versionData?.minor > 84) ? "statistics" : "stats";
  }
  const { data: immichData, error: immichError } = useWidgetAPI(widget, statsEndpoint);

  if (immichError || versionError || immichData?.statusCode === 401) {
    return <Container service={service} error={immichData ?? immichError ?? versionError} />;
  }

  if (!immichData) {
    return (
      <Container service={service}>
        <Block label="immich.users" />
        <Block label="immich.photos" />
        <Block label="immich.videos" />
        <Block label="immich.storage" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="immich.users" value={t("common.number", { value: immichData.usageByUser.length })} />
      <Block label="immich.photos" value={t("common.number", { value: immichData.photos })} />
      <Block label="immich.videos" value={t("common.number", { value: immichData.videos })} />
      <Block
        label="immich.storage"
        value={
          // backwards-compatible e.g. '9 GiB'
          immichData.usage.toString().toLowerCase().includes("b")
            ? immichData.usage
            : t("common.bytes", {
                value: immichData.usage,
                maximumFractionDigits: 1,
                binary: true, // match immich
              })
        }
      />
    </Container>
  );
}
