import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  // eslint-disable-next-line prefer-const
  let { data: spoolData, error: spoolError } = useWidgetAPI(widget, "spools");

  if (spoolError) {
    return <Container service={service} error={spoolError} />;
  }

  if (!spoolData) {
    const nBlocksGuess = widget.spoolIds?.length ?? 4;
    return (
      <Container service={service}>
        {[...Array(nBlocksGuess)].map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Block key={i} label="spoolman.loading" />
        ))}
      </Container>
    );
  }

  if (spoolData.error || spoolData.message) {
    return <Container service={service} error={spoolData?.error ?? spoolData} />;
  }

  if (spoolData.length === 0) {
    return (
      <Container service={service}>
        <Block label="spoolman.noSpools" />
      </Container>
    );
  }

  if (widget.spoolIds?.length) {
    spoolData = spoolData.filter((spool) => widget.spoolIds.includes(spool.id));
  }

  if (spoolData.length > 4) {
    spoolData = spoolData.slice(0, 4);
  }

  return (
    <Container service={service}>
      {spoolData.map((spool) => (
        <Block
          key={spool.id}
          label={spool.filament.name}
          value={t("common.percent", {
            value: (spool.remaining_weight / spool.initial_weight) * 100,
          })}
        />
      ))}
    </Container>
  );
}
