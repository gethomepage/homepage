import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  /** @type {{widget: { fields: string[] }}} */
  const { widget } = service;

  /** @type { { data: { label: string, count: number }[], error: unk }} */
  const { data: suwayomiData, error: suwayomiError } = useWidgetAPI(widget);

  if (suwayomiError) {
    return <Container service={service} error={suwayomiError} />;
  }

  if (!suwayomiData) {
    if (widget.fields.length > 4) {
      widget.fields.length = 4;
    }
    return (
      <Container service={service}>
        {widget.fields.map((Field) => {
          const field = Field.toLowerCase();
          return <Block key={field} label={`suwayomi.${field}`} />;
        })}
      </Container>
    );
  }

  return (
    <Container service={service}>
      {suwayomiData.map((data) => (
        <Block key={data.label} label={data.label} value={t("common.number", { value: data.count })} />
      ))}
    </Container>
  );
}
