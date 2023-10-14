import { useContext, useMemo } from "react";
import dynamic from "next/dynamic";

import { ShowDateContext } from "../../utils/contexts/calendar";

import MonthlyView from "./monthly-view";

import Container from "components/services/widget/container";

export default function Component({ service }) {
  const { widget } = service;
  const { showDate } = useContext(ShowDateContext);

  // params for API fetch
  const params = useMemo(() => {
    if (!showDate) {
      return {};
    }

    return {
      start: showDate.minus({months: 3}).toFormat("yyyy-MM-dd"),
      end: showDate.plus({months: 3}).toFormat("yyyy-MM-dd"),
      unmonitored: 'false',
    };
  }, [showDate]);

  // Load active integrations
  const integrations = useMemo(() => widget.integrations?.map(integration => ({
    service: dynamic(() => import(`./integrations/${integration?.type}`)),
    widget: integration,
  })) ?? [], [widget.integrations]);

  return <Container service={service}>
    <div className="flex flex-col w-full">
      <div className="sticky top-0">
        {integrations.map(integration => {
          const Integration = integration.service;
          const key = integration.widget.type + integration.widget.service_name + integration.widget.service_group;

          return <Integration key={key} config={integration.widget} params={params}
                              className="fixed bottom-0 left-0 bg-red-500 w-screen h-12" />
        })}
      </div>
      <MonthlyView service={service} className="flex"/>
    </div>
  </Container>;
}
