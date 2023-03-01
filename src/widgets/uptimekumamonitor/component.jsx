import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;
  const { data: isUp} = useWidgetAPI(widget);
  const { t } = useTranslation();
  let upIndicator;
 
  if (!isUp) {
    return (
      <Container service={service}>
      <Block label="Status"/>
      </Container>
    );
  }
  if (isUp.data.includes("Up")) upIndicator = <span className="text-green-500">{t("uptimekumamonitor.up")}</span>
  else if (isUp.data.includes("Maintenance")) upIndicator = <span style={{color: '#1747f5'}}>{t("uptimekumamonitor.maintenance")}</span>
  else if (isUp.data.includes("N/A")) upIndicator = <span>N/A</span>
  else upIndicator = <span className="text-red-500">{t("uptimekumamonitor.down")}</span>

  return (
    <Container service={service}>
      <Block label="Status" value={upIndicator} />
    </Container>
  );
}