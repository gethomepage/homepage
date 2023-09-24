import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: opendtuLiveData, error: opendtuError } = useWidgetAPI(widget);

  if (opendtuError) {
    return <Container service={service} error={opendtuError} />;
  }
  
  if (!opendtuLiveData) {
    return (
      <Container service={service}>
        <Block label="opendtu.relativeGeneration" />
        <Block label="opendtu.totalGeneration" />
        <Block label="opendtu.limit" />
      </Container>
    );
  }

  const totalGeneration = opendtuLiveData.inverters.map(inverter => 
      Object.values(inverter.AC).map(
        AC => AC.Power.v
      ).reduce((a,b) => a+b))
    .reduce((a,b) => a+b);
  
  const totalLimit = opendtuLiveData.inverters.map(inverter => inverter.limit_absolute).reduce((a,b) => a+b);

  const usagePercentage = (totalGeneration / totalLimit) * 100

  return (
    <Container service={service}>
      <Block label="opendtu.relativeGeneration" value={t("common.number", { value: Math.round(usagePercentage), style: "unit", unit: "percent" })} />
      <Block label="opendtu.totalGeneration" value={`${t("common.number", { value: Math.round(totalGeneration), style: "unit"})}W`} />
      <Block label="opendtu.limit" value={`${t("common.number", { value: Math.round(totalLimit), style: "unit"})}W`} />
    </Container>
  );
}
