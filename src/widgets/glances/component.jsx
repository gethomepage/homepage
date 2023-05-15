import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

function convertToFahrenheit(t) {
  return t * 9/5 + 32;
}

export default function GlancesStats({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: memData, error: memError } = useWidgetAPI(widget, "mem");
  const { data: tempData, error: tempError } = useWidgetAPI(widget, "temp");

  if (memError || tempError) {
    return <Container error={memError || tempError} />;
  }

  if (!memData || !tempData) {
    return (
      <Container service={service}>
        <Block label="Memory Usage" value="N/A" />
        <Block label="Temperature" value="N/A" />
      </Container>
    );
  }

  const unit = "celsius";
  const memPercent = Math.round((memData.used / memData.total) * 100);
  const tempValue = tempData[0].value;

  return (
    <Container service={service}>
      <Block label="Memory" value={`${memPercent}%`} />
      <Block
        label="Temp"
        value={`${t("common.number", {
          value: unit === "celsius" ? tempValue : convertToFahrenheit(tempValue),
          style: "unit",
          unit,
          maximumFractionDigits: 1,
        })}`}
      />
    </Container>
  );
}
