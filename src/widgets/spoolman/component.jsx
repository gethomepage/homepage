import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: spoolData, error: spoolError } = useWidgetAPI(widget, "spools");

  if (spoolError) {
    return <Container service={service} error={spoolError} />;
  }

  if (!spoolData) {
    return (
      <Container service={service}>
        <Block label="spoolman.spool1" />
        <Block label="spoolman.spool2" />
      </Container>
    );
  }

  if (spoolData.error || spoolData.message) {
    return <Container service={service} error={spoolData?.error ?? spoolData} />;
  }

  return (
    <Container service={service}>
      {spoolData.map((spool) => (
        <Block
          key={spool.id}
          label={`${spool.filament.name}`}
          value={`${t("common.percent", { value: (100-(spool.used_weight / spool.initial_weight)*100)})}`} 
        />
      ))}
    </Container>
  );
}
