import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { data, error } = useWidgetAPI(service.widget);

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return null;
  }

  const { up, bytesTx, bytesRx } = data;

  return (
    <Container service={service}>
      <Block
        label="widget.status"
        value={
          up ? (
            <span className="text-green-500">{t("openwrt.up")}</span>
          ) : (
            <span className="text-red-500">{t("openwrt.down")}</span>
          )
        }
      />
      <Block label="openwrt.bytesTx" value={t("common.bytes", { value: bytesTx })} />
      <Block label="openwrt.bytesRx" value={t("common.bytes", { value: bytesRx })} />
    </Container>
  );
}
