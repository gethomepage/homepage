import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";
import useWidgetAPI from "utils/proxy/use-widget-api";

const SparkyFitness = ({ service }) => {
  const { t } = useTranslation();
  const { widget } = service;
  const { data, error, isLoading } = useWidgetAPI(widget, "stats");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (isLoading || !data) {
    return (
      <Container service={service}>
        <Block label="sparkyfitness.eaten" />
        <Block label="sparkyfitness.burned" />
        <Block label="sparkyfitness.remaining" />
        <Block label="sparkyfitness.steps" />
      </Container>
    );
  }

  const { eaten, burned, remaining, goal, progress, unit, steps } = data;

  return (
    <Container service={service}>
      <Block 
        label={t("sparkyfitness.eaten", "Eaten")} 
        value={t("common.number", { value: eaten })} 
      />
      <Block 
        label={t("sparkyfitness.burned", "Burned")} 
        value={t("common.number", { value: burned })} 
      />
      <Block 
        label={t("sparkyfitness.remaining", "Remaining")} 
        value={t("common.number", { value: remaining })} 
      />
      <Block 
        label={t("sparkyfitness.steps", "Steps")} 
        value={t("common.number", { value: steps })} 
      />
    </Container>
  );
};

export default SparkyFitness;
