import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: spoolData, error: spoolError } = useWidgetAPI(widget, "spools");

  // Helper to handle filtering based on spoolIds
  const filterSpools = (data, spoolIds) => {
    if (!spoolIds || spoolIds.length === 0) return data; // No filtering if no spoolIds
    const limitedspoolIds = spoolIds.slice(0, 4); // Limit to 4 names
    return data.filter(spool => spoolIds.includes(spool.id));
  };

  // Helper to limit spoolData length
  const limitSpoolData = (data, limit = 4) => (data.length > limit ? data.slice(0, limit) : data);

  // Error handling
  if (spoolError) {
    return <Container service={service} error={spoolError} />;
  }

  // Loading state
  if (!spoolData) {
    return (
      <Container service={service}>
        <Block label="spoolman.spool1" />
        <Block label="spoolman.spool2" />
      </Container>
    );
  }

  // API error or unexpected response
  if (spoolData.error || spoolData.message) {
    return <Container service={service} error={spoolData?.error ?? spoolData} />;
  }

  // No spools available
  if (spoolData.length === 0) {
    return (
      <Container service={service}>
        <Block label="spoolman.noSpools" />
      </Container>
    );
  }

  // Filter and limit spools
  let filteredSpoolData = filterSpools(spoolData, widget.spoolIds);
  filteredSpoolData = limitSpoolData(filteredSpoolData);

  // Render filtered and limited spools
  return (
    <Container service={service}>
      {filteredSpoolData.map((spool) => (
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
