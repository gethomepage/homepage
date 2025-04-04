import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useEffect, useState } from "react";

import { formatProxyUrl } from "utils/proxy/api-helpers";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: workersData, error: workersError } = useWidgetAPI(widget, "workers");

  const [pendingData, setPendingData] = useState(null);

  useEffect(() => {
    async function fetchPending() {
      const url = formatProxyUrl(widget, "pending");
      const res = await fetch(url, { method: "POST" });
      setPendingData(await res.json());
    }
    if (!pendingData) {
      fetchPending();
    }
  }, [widget, pendingData]);

  if (workersError) {
    return <Container service={service} error={workersError} />;
  }

  if (!workersData || !pendingData) {
    return (
      <Container service={service}>
        <Block label="unmanic.active_workers" />
        <Block label="unmanic.total_workers" />
        <Block label="unmanic.records_total" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="unmanic.active_workers" value={workersData.active_workers} />
      <Block label="unmanic.total_workers" value={workersData.total_workers} />
      <Block label="unmanic.records_total" value={pendingData.recordsTotal} />
    </Container>
  );
}
