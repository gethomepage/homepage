import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: scriptedData, error: scriptedError } = useWidgetAPI(widget, '');

  if (scriptedError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!scriptedData) {
    return (
      <Container service={service}>
        {widget.fields?.map(field => (
          <Block key={field} label={field} />
        ))}
      </Container>
    );
  }

  (scriptedData || []).forEach(e => {
    if (e.type && e.value !== undefined) {
      if (typeof e.type === 'object') {
         e.typedValue = t(e.type.type, {...e.type, type: null, value: e.value});
      } else if (e.type == 'boolean') {
        e.typedValue = t(e.value ? 'scripted.yes' : 'scripted.no');
      } else {
        e.typedValue = t(e.type, { value: e.value });
      }
    } else {
      e.typedValue = e.value;
    }
  })

  return (
    <div className="relative flex flex-row w-full">
      {(scriptedData || []).map(e => (
        <Block key={e.name} label={e.label} value={e.typedValue} />
      ))}
    </div>
  );
}
