import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const UNRAID_DEFAULT_FIELDS = ["status", "cpu", "memoryPercent", "notifications"];
const MAX_ALLOWED_FIELDS = 4;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget);

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    if (!widget.display?.length > 0) {
      widget.display = UNRAID_DEFAULT_FIELDS;
    } else if (widget.display.length > MAX_ALLOWED_FIELDS) {
      widget.display = widget.display.slice(0, MAX_ALLOWED_FIELDS);
    }

    return (
      <Container service={service}>
        {widget.display.map((field) => {
          const poolMatch = field.match(/^(pool\d)(.+)/);
          if (poolMatch) {
            const poolName = widget?.[poolMatch[1]] || poolMatch[1];
            const fieldName = "pool" + poolMatch[2];
            return <Block key={field} label={t(`unraid.${fieldName}`, { pool: poolName })} />;
          }
          return <Block key={field} label={`unraid.${field}`} />;
        })}
      </Container>
    );
  }

  return (
    <Container service={service}>
      {data.map((data) => (
        <Block
          key={data.key ?? data.label}
          label={data.poolName ? t(data.label, { pool: data.poolName }) : data.label}
          value={t(data.t, { value: data.value })}
        />
      ))}
    </Container>
  );
}
